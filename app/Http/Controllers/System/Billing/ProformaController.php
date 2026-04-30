<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Mail\BillingDocumentMail;
use App\Models\BillingDocument;
use App\Models\Client;
use App\Models\CompanySetting;
use App\Models\Trip;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ProformaController extends Controller
{
    public function index(Request $request)
    {
        $query = BillingDocument::with('client')
            ->where('type', 'proforma')
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('document_number', 'like', "%{$s}%")
                  ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $proformas = $query->paginate(15)->withQueryString();

        $stats = [
            'total'    => BillingDocument::where('type', 'proforma')->count(),
            'draft'    => BillingDocument::where('type', 'proforma')->where('status', 'draft')->count(),
            'sent'     => BillingDocument::where('type', 'proforma')->where('status', 'sent')->count(),
            'accepted' => BillingDocument::where('type', 'proforma')->where('status', 'accepted')->count(),
        ];

        return Inertia::render('system/Billing/Proformas/Index', [
            'proformas' => $proformas,
            'stats'     => $stats,
            'statuses'  => BillingDocument::$proformaStatuses,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Billing/Proformas/Create', [
            'statuses'   => BillingDocument::$proformaStatuses,
            'nextNumber' => BillingDocument::nextNumber('proforma'),
            'clients'    => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'      => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
        ]);
    }

    public function store(Request $request)
    {
        $data  = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($data, $items, $request, &$doc) {
            $data['type']            = 'proforma';
            $data['document_number'] = BillingDocument::nextNumber('proforma');
            $data['created_by']      = $request->user()->id;
            $doc = BillingDocument::create($data);
            $this->syncItems($doc, $items);
            $this->recalculate($doc);
        });

        return redirect()->route('system.billing.proformas.show', $doc)
            ->with('success', "Proforma {$doc->document_number} created.");
    }

    public function show(BillingDocument $proforma)
    {
        $proforma->load(['client', 'trip', 'items', 'convertedFrom', 'conversions']);
        $proforma->append(['amount_paid', 'balance_due']);

        return Inertia::render('system/Billing/Proformas/Show', [
            'proforma' => $proforma,
            'statuses' => BillingDocument::$proformaStatuses,
            'company'  => CompanySetting::first(),
        ]);
    }

    public function edit(BillingDocument $proforma)
    {
        $proforma->load('items');
        return Inertia::render('system/Billing/Proformas/Edit', [
            'proforma' => $proforma,
            'statuses' => BillingDocument::$proformaStatuses,
            'clients'  => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'    => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
        ]);
    }

    public function update(Request $request, BillingDocument $proforma)
    {
        $data  = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($proforma, $data, $items) {
            $proforma->update($data);
            $this->syncItems($proforma, $items);
            $this->recalculate($proforma);
        });

        return redirect()->route('system.billing.proformas.show', $proforma)
            ->with('success', "Proforma updated.");
    }

    public function destroy(BillingDocument $proforma)
    {
        $proforma->delete();
        return redirect()->route('system.billing.proformas.index')->with('success', "Proforma deleted.");
    }

    public function send(Request $request, BillingDocument $proforma)
    {
        $data = $request->validate([
            'to'      => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $proforma->load(['client', 'trip', 'items']);
        $proforma->append(['amount_paid', 'balance_due']);

        Mail::to($data['to'])->send(
            new BillingDocumentMail(
                document:      $proforma,
                company:       CompanySetting::first(),
                customMessage: $data['message'] ?? '',
                emailSubject:  $data['subject'],
            )
        );

        return back()->with('success', "Proforma {$proforma->document_number} sent to {$data['to']}.");
    }

    public function convertToInvoice(BillingDocument $proforma)
    {
        $proforma->load('items');

        $invoice = DB::transaction(function () use ($proforma) {
            $inv = BillingDocument::create([
                'type'              => 'invoice',
                'document_number'   => BillingDocument::nextNumber('invoice'),
                'client_id'         => $proforma->client_id,
                'trip_id'           => $proforma->trip_id,
                'status'            => 'draft',
                'issue_date'        => now()->toDateString(),
                'due_date'          => $proforma->due_date ?? now()->addDays(30)->toDateString(),
                'currency'          => $proforma->currency,
                'subtotal'          => $proforma->subtotal,
                'discount_amount'   => $proforma->discount_amount,
                'tax_rate'          => $proforma->tax_rate,
                'tax_amount'        => $proforma->tax_amount,
                'total'             => $proforma->total,
                'notes'             => $proforma->notes,
                'terms_conditions'  => $proforma->terms_conditions,
                'converted_from_id' => $proforma->id,
                'created_by'        => auth()->id(),
            ]);

            foreach ($proforma->items as $item) {
                $inv->items()->create($item->only(['description', 'quantity', 'unit', 'unit_price', 'total', 'sort_order']));
            }

            $proforma->update(['status' => 'accepted']);
            return $inv;
        });

        return redirect()->route('system.billing.invoices.show', $invoice)
            ->with('success', "Invoice {$invoice->document_number} created from {$proforma->document_number}.");
    }

    private function validateDocument(Request $request): array
    {
        return $request->validate([
            'client_id'        => 'required|exists:clients,id',
            'trip_id'          => 'nullable|exists:trips,id',
            'status'           => 'required|in:' . implode(',', array_keys(BillingDocument::$proformaStatuses)),
            'issue_date'       => 'required|date',
            'due_date'         => 'nullable|date',
            'valid_until'      => 'nullable|date',
            'currency'         => 'required|string|max:10',
            'discount_amount'  => 'nullable|numeric|min:0',
            'tax_rate'         => 'nullable|numeric|min:0|max:100',
            'notes'            => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);
    }

    private function validateItems(Request $request): array
    {
        $request->validate([
            'items'               => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity'    => 'required|numeric|min:0.01',
            'items.*.unit'        => 'nullable|string|max:30',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);
        return $request->items;
    }

    private function syncItems(BillingDocument $doc, array $items): void
    {
        $doc->items()->delete();
        foreach ($items as $i => $item) {
            $doc->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit'        => $item['unit'] ?? null,
                'unit_price'  => $item['unit_price'],
                'total'       => round($item['quantity'] * $item['unit_price'], 2),
                'sort_order'  => $i,
            ]);
        }
    }

    public function download(BillingDocument $proforma)
    {
        $proforma->load('client', 'trip', 'items');
        $company  = CompanySetting::get();
        $statuses = BillingDocument::$proformaStatuses;

        $pdf = Pdf::loadView('pdf.billing-document', ['doc' => $proforma, 'company' => $company, 'statuses' => $statuses])
            ->setPaper('a4', 'portrait');

        return $pdf->download("{$proforma->document_number}.pdf");
    }

    private function recalculate(BillingDocument $doc): void
    {
        $doc->refresh();
        $subtotal = $doc->items()->sum(DB::raw('quantity * unit_price'));
        $discount = (float) $doc->discount_amount;
        $taxable  = $subtotal - $discount;
        $taxAmt   = round($taxable * $doc->tax_rate / 100, 2);
        $doc->update([
            'subtotal'   => round($subtotal, 2),
            'tax_amount' => $taxAmt,
            'total'      => round($taxable + $taxAmt, 2),
        ]);
    }
}

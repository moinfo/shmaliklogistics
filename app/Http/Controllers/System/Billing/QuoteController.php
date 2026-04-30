<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Mail\BillingDocumentMail;
use App\Models\BillingDocument;
use App\Models\BillingItem;
use App\Models\Client;
use App\Models\CompanySetting;
use App\Models\Trip;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $query = BillingDocument::with('client')
            ->where('type', 'quote')
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

        $quotes = $query->paginate(15)->withQueryString();

        $stats = [
            'total'    => BillingDocument::where('type', 'quote')->count(),
            'draft'    => BillingDocument::where('type', 'quote')->where('status', 'draft')->count(),
            'sent'     => BillingDocument::where('type', 'quote')->where('status', 'sent')->count(),
            'accepted' => BillingDocument::where('type', 'quote')->where('status', 'accepted')->count(),
        ];

        return Inertia::render('system/Billing/Quotes/Index', [
            'quotes'   => $quotes,
            'stats'    => $stats,
            'statuses' => BillingDocument::$quoteStatuses,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Billing/Quotes/Create', [
            'statuses'   => BillingDocument::$quoteStatuses,
            'nextNumber' => BillingDocument::nextNumber('quote'),
            'clients'    => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'      => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($data, $items, $request, &$doc) {
            $data['type']           = 'quote';
            $data['document_number'] = BillingDocument::nextNumber('quote');
            $data['created_by']     = $request->user()->id;
            $doc = BillingDocument::create($data);
            $this->syncItems($doc, $items);
            $this->recalculate($doc);
        });

        return redirect()->route('system.billing.quotes.show', $doc)
            ->with('success', "Quote {$doc->document_number} created.");
    }

    public function show(BillingDocument $quote)
    {
        $quote->load(['client', 'trip', 'items', 'convertedFrom']);
        $quote->append(['amount_paid', 'balance_due']);

        return Inertia::render('system/Billing/Quotes/Show', [
            'quote'    => $quote,
            'statuses' => BillingDocument::$quoteStatuses,
            'company'  => CompanySetting::first(),
        ]);
    }

    public function edit(BillingDocument $quote)
    {
        $quote->load('items');
        return Inertia::render('system/Billing/Quotes/Edit', [
            'quote'    => $quote,
            'statuses' => BillingDocument::$quoteStatuses,
            'clients'  => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'    => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
        ]);
    }

    public function update(Request $request, BillingDocument $quote)
    {
        $data  = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($quote, $data, $items) {
            $quote->update($data);
            $this->syncItems($quote, $items);
            $this->recalculate($quote);
        });

        return redirect()->route('system.billing.quotes.show', $quote)
            ->with('success', "Quote updated.");
    }

    public function destroy(BillingDocument $quote)
    {
        $quote->delete();
        return redirect()->route('system.billing.quotes.index')->with('success', "Quote deleted.");
    }

    public function convertToProforma(BillingDocument $quote)
    {
        $quote->load('items');

        $proforma = DB::transaction(function () use ($quote) {
            $pro = BillingDocument::create([
                'type'              => 'proforma',
                'document_number'   => BillingDocument::nextNumber('proforma'),
                'client_id'         => $quote->client_id,
                'trip_id'           => $quote->trip_id,
                'status'            => 'draft',
                'issue_date'        => now()->toDateString(),
                'due_date'          => $quote->due_date,
                'valid_until'       => $quote->valid_until,
                'currency'          => $quote->currency,
                'subtotal'          => $quote->subtotal,
                'discount_amount'   => $quote->discount_amount,
                'tax_rate'          => $quote->tax_rate,
                'tax_amount'        => $quote->tax_amount,
                'total'             => $quote->total,
                'notes'             => $quote->notes,
                'terms_conditions'  => $quote->terms_conditions,
                'converted_from_id' => $quote->id,
                'created_by'        => auth()->id(),
            ]);

            foreach ($quote->items as $item) {
                $pro->items()->create($item->only(['description', 'quantity', 'unit', 'unit_price', 'total', 'sort_order']));
            }

            $quote->update(['status' => 'accepted']);
            return $pro;
        });

        return redirect()->route('system.billing.proformas.show', $proforma)
            ->with('success', "Proforma {$proforma->document_number} created from {$quote->document_number}.");
    }

    public function send(Request $request, BillingDocument $quote)
    {
        $data = $request->validate([
            'to'      => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $quote->load(['client', 'trip', 'items']);
        $quote->append(['amount_paid', 'balance_due']);

        Mail::to($data['to'])->send(
            new BillingDocumentMail(
                document:      $quote,
                company:       CompanySetting::first(),
                customMessage: $data['message'] ?? '',
                emailSubject:  $data['subject'],
            )
        );

        return back()->with('success', "Quote {$quote->document_number} sent to {$data['to']}.");
    }

    // ── Shared helpers ──────────────────────────────────────────────────────

    private function validateDocument(Request $request): array
    {
        return $request->validate([
            'client_id'        => 'required|exists:clients,id',
            'trip_id'          => 'nullable|exists:trips,id',
            'status'           => 'required|in:' . implode(',', array_keys(BillingDocument::$quoteStatuses)),
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
            'items'             => 'required|array|min:1',
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

    public function download(BillingDocument $quote)
    {
        $quote->load('client', 'trip', 'items');
        $company  = CompanySetting::get();
        $statuses = BillingDocument::$quoteStatuses;

        $pdf = Pdf::loadView('pdf.billing-document', ['doc' => $quote, 'company' => $company, 'statuses' => $statuses])
            ->setPaper('a4', 'portrait');

        return $pdf->download("{$quote->document_number}.pdf");
    }

    private function recalculate(BillingDocument $doc): void
    {
        $doc->refresh();
        $subtotal = $doc->items()->sum(DB::raw('quantity * unit_price'));
        $discount = (float) $doc->discount_amount;
        $taxable  = $subtotal - $discount;
        $taxAmt   = round($taxable * $doc->tax_rate / 100, 2);
        $doc->update([
            'subtotal'  => round($subtotal, 2),
            'tax_amount' => $taxAmt,
            'total'     => round($taxable + $taxAmt, 2),
        ]);
    }
}

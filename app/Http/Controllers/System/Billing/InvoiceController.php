<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = BillingDocument::with('client')
            ->where('type', 'invoice')
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

        $invoices = $query->paginate(15)->withQueryString();

        // Append payment info for each invoice
        $invoices->getCollection()->transform(function (BillingDocument $inv) {
            $inv->append(['amount_paid', 'balance_due']);
            return $inv;
        });

        $stats = [
            'total'       => BillingDocument::where('type', 'invoice')->count(),
            'outstanding' => BillingDocument::where('type', 'invoice')->whereIn('status', ['sent', 'partial', 'overdue'])->count(),
            'paid'        => BillingDocument::where('type', 'invoice')->where('status', 'paid')->count(),
            'total_billed' => BillingDocument::where('type', 'invoice')->sum('total'),
            'total_paid'   => Payment::whereHas('invoice', fn ($q) => $q->where('type', 'invoice'))->sum('amount'),
        ];

        return Inertia::render('system/Billing/Invoices/Index', [
            'invoices' => $invoices,
            'stats'    => $stats,
            'statuses' => BillingDocument::$invoiceStatuses,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Billing/Invoices/Create', [
            'statuses'   => BillingDocument::$invoiceStatuses,
            'nextNumber' => BillingDocument::nextNumber('invoice'),
            'clients'    => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'      => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
            'methods'    => Payment::$methods,
        ]);
    }

    public function store(Request $request)
    {
        $data  = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($data, $items, $request, &$doc) {
            $data['type']            = 'invoice';
            $data['document_number'] = BillingDocument::nextNumber('invoice');
            $data['created_by']      = $request->user()->id;
            $doc = BillingDocument::create($data);
            $this->syncItems($doc, $items);
            $this->recalculate($doc);
        });

        return redirect()->route('system.billing.invoices.show', $doc)
            ->with('success', "Invoice {$doc->document_number} created.");
    }

    public function show(BillingDocument $invoice)
    {
        $invoice->load(['client', 'trip', 'items', 'payments', 'convertedFrom']);
        $invoice->append(['amount_paid', 'balance_due']);

        return Inertia::render('system/Billing/Invoices/Show', [
            'invoice'  => $invoice,
            'statuses' => BillingDocument::$invoiceStatuses,
            'methods'  => Payment::$methods,
        ]);
    }

    public function edit(BillingDocument $invoice)
    {
        $invoice->load('items');
        return Inertia::render('system/Billing/Invoices/Edit', [
            'invoice'  => $invoice,
            'statuses' => BillingDocument::$invoiceStatuses,
            'clients'  => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'trips'    => Trip::latest()->limit(50)->get(['id', 'trip_number', 'route_from', 'route_to']),
        ]);
    }

    public function update(Request $request, BillingDocument $invoice)
    {
        $data  = $this->validateDocument($request);
        $items = $this->validateItems($request);

        DB::transaction(function () use ($invoice, $data, $items) {
            $invoice->update($data);
            $this->syncItems($invoice, $items);
            $this->recalculate($invoice);
        });

        return redirect()->route('system.billing.invoices.show', $invoice)
            ->with('success', "Invoice updated.");
    }

    public function destroy(BillingDocument $invoice)
    {
        $invoice->delete();
        return redirect()->route('system.billing.invoices.index')->with('success', "Invoice deleted.");
    }

    public function recordPayment(Request $request, BillingDocument $invoice)
    {
        $data = $request->validate([
            'amount'           => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:' . implode(',', array_keys(Payment::$methods)),
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string',
        ]);

        $data['billing_document_id'] = $invoice->id;
        $data['created_by']          = $request->user()->id;

        Payment::create($data);

        // Update invoice status
        $invoice->refresh();
        $paid  = $invoice->amount_paid;
        $total = (float) $invoice->total;

        $newStatus = match(true) {
            $paid >= $total        => 'paid',
            $paid > 0              => 'partial',
            default                => $invoice->status,
        };
        $invoice->update(['status' => $newStatus]);

        return back()->with('success', 'Payment recorded.');
    }

    private function validateDocument(Request $request): array
    {
        return $request->validate([
            'client_id'        => 'required|exists:clients,id',
            'trip_id'          => 'nullable|exists:trips,id',
            'status'           => 'required|in:' . implode(',', array_keys(BillingDocument::$invoiceStatuses)),
            'issue_date'       => 'required|date',
            'due_date'         => 'nullable|date',
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

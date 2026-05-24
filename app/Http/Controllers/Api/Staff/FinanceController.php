<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function invoices(Request $request): JsonResponse
    {
        $query = BillingDocument::with('client:id,name,company_name')
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

        $invoices = $query->paginate(20)->withQueryString();

        // Shape each invoice with payment info for the mobile list view
        $invoices->getCollection()->transform(function (BillingDocument $inv) {
            $inv->append(['amount_paid', 'balance_due']);

            return [
                'id'              => $inv->id,
                'document_number' => $inv->document_number,
                'client_id'       => $inv->client_id,
                'client_name'     => $inv->client?->name,
                'client_company'  => $inv->client?->company_name,
                'currency'        => $inv->currency,
                'total'           => (float) $inv->total,
                'amount_paid'     => $inv->amount_paid,
                'balance_due'     => $inv->balance_due,
                'status'          => $inv->status,
                'issue_date'      => $inv->issue_date?->toDateString(),
                'due_date'        => $inv->due_date?->toDateString(),
            ];
        });

        return response()->json([
            'invoices' => $invoices,
            'statuses' => BillingDocument::$invoiceStatuses,
        ]);
    }

    public function invoiceShow(BillingDocument $invoice): JsonResponse
    {
        abort_unless($invoice->type === 'invoice', 404);

        $invoice->load(['client:id,name,company_name,email,phone', 'trip:id,trip_number,route_from,route_to', 'items', 'payments']);
        $invoice->append(['amount_paid', 'balance_due']);

        return response()->json([
            'invoice'  => $invoice,
            'statuses' => BillingDocument::$invoiceStatuses,
            'methods'  => Payment::$methods,
            'stages'   => Payment::$stages,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $query = Payment::with(['invoice:id,document_number,client_id', 'invoice.client:id,name,company_name'])
            ->latest('payment_date');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('reference_number', 'like', "%{$s}%")
                  ->orWhereHas('invoice.client', fn ($cq) => $cq->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('invoice', fn ($iq) => $iq->where('document_number', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }

        $payments = $query->paginate(20)->withQueryString();

        $payments->getCollection()->transform(function (Payment $pay) {
            return [
                'id'               => $pay->id,
                'invoice_id'       => $pay->billing_document_id,
                'document_number'  => $pay->invoice?->document_number,
                'client_name'      => $pay->invoice?->client?->name,
                'client_company'   => $pay->invoice?->client?->company_name,
                'amount'           => (float) $pay->amount,
                'payment_method'   => $pay->payment_method,
                'payment_stage'    => $pay->payment_stage,
                'reference_number' => $pay->reference_number,
                'payment_date'     => $pay->payment_date?->toDateString(),
            ];
        });

        return response()->json([
            'payments' => $payments,
            'methods'  => Payment::$methods,
            'stages'   => Payment::$stages,
        ]);
    }

    public function debtors(Request $request): JsonResponse
    {
        $search  = $request->input('search', '');
        $ageBand = $request->input('age', '');   // '30', '60', '90', '90+'

        // Load all unpaid/partial invoices with their payments (mirrors web DebtorsController)
        $query = BillingDocument::with(['client', 'payments', 'trip'])
            ->where('type', 'invoice')
            ->whereNotIn('status', ['paid', 'cancelled', 'draft'])
            ->orderBy('due_date');

        if ($search) {
            $query->whereHas('client', fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
            );
        }

        $invoices = $query->get()->map(function ($inv) {
            $paid        = (float) $inv->payments->sum('amount');
            $balance     = (float) $inv->total - $paid;
            $daysOverdue = $inv->due_date ? now()->diffInDays($inv->due_date, false) * -1 : 0;

            return [
                'id'              => $inv->id,
                'document_number' => $inv->document_number,
                'issue_date'      => $inv->issue_date?->toDateString(),
                'due_date'        => $inv->due_date?->toDateString(),
                'currency'        => $inv->currency ?? 'TZS',
                'total'           => (float) $inv->total,
                'amount_paid'     => $paid,
                'balance_due'     => $balance,
                'days_overdue'    => max(0, (int) $daysOverdue),
                'status'          => $inv->status,
                'trip_number'     => $inv->trip?->trip_number,
                'client_id'       => $inv->client_id,
                'client_name'     => $inv->client?->name,
                'client_company'  => $inv->client?->company_name,
            ];
        })->filter(fn ($r) => $r['balance_due'] > 0.01);

        // Apply age-band filter after computing days_overdue
        if ($ageBand) {
            $invoices = $invoices->filter(function ($r) use ($ageBand) {
                $d = $r['days_overdue'];
                return match($ageBand) {
                    '30'    => $d > 0  && $d <= 30,
                    '60'    => $d > 30 && $d <= 60,
                    '90'    => $d > 60 && $d <= 90,
                    '90+'   => $d > 90,
                    'future'=> $d <= 0,
                    default => true,
                };
            });
        }

        // Group by client
        $debtors = $invoices->groupBy('client_id')->map(function ($rows, $clientId) {
            $first = $rows->first();
            return [
                'client_id'      => $clientId,
                'client_name'    => $first['client_name'],
                'client_company' => $first['client_company'],
                'total_invoiced' => $rows->sum('total'),
                'total_paid'     => $rows->sum('amount_paid'),
                'balance_due'    => $rows->sum('balance_due'),
                'max_days'       => $rows->max('days_overdue'),
                'invoices'       => $rows->values(),
            ];
        })->sortByDesc('balance_due')->values();

        $totals = [
            'total_ar'     => $debtors->sum('balance_due'),
            'overdue_30'   => $invoices->where('days_overdue', '>', 0)->where('days_overdue', '<=', 30)->sum('balance_due'),
            'overdue_60'   => $invoices->where('days_overdue', '>', 30)->where('days_overdue', '<=', 60)->sum('balance_due'),
            'overdue_90'   => $invoices->where('days_overdue', '>', 60)->where('days_overdue', '<=', 90)->sum('balance_due'),
            'overdue_90p'  => $invoices->where('days_overdue', '>', 90)->sum('balance_due'),
            'debtor_count' => $debtors->count(),
        ];

        return response()->json([
            'debtors' => $debtors,
            'totals'  => $totals,
        ]);
    }

    public function recordPayment(Request $request, BillingDocument $invoice): JsonResponse
    {
        abort_unless($invoice->type === 'invoice', 404);

        // Same validation as web InvoiceController@recordPayment
        $data = $request->validate([
            'amount'           => 'required|numeric|min:0.01',
            'usd_amount'       => 'nullable|numeric|min:0',
            'exchange_rate'    => 'nullable|numeric|min:0',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:' . implode(',', array_keys(Payment::$methods)),
            'payment_stage'    => 'nullable|in:' . implode(',', array_keys(Payment::$stages)),
            'reference_number' => 'nullable|string|max:100',
            'cheque_number'    => 'nullable|string|max:50',
            'cheque_date'      => 'nullable|date',
            'notes'            => 'nullable|string',
        ]);

        $data['billing_document_id'] = $invoice->id;
        $data['created_by']          = $request->user()->id;

        Payment::create($data);

        // Update invoice status (same logic as web)
        $invoice->refresh();
        $paid  = $invoice->amount_paid;
        $total = (float) $invoice->total;

        $newStatus = match(true) {
            $paid >= $total => 'paid',
            $paid > 0       => 'partial',
            default         => $invoice->status,
        };
        $invoice->update(['status' => $newStatus]);

        // Return the updated invoice in the same shape as invoiceShow
        $invoice->load(['client:id,name,company_name,email,phone', 'trip:id,trip_number,route_from,route_to', 'items', 'payments']);
        $invoice->append(['amount_paid', 'balance_due']);

        return response()->json([
            'invoice' => $invoice,
        ]);
    }
}
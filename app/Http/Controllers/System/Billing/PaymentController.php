<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['invoice.client'])
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

        $stats = [
            'total_payments' => Payment::count(),
            'total_received' => Payment::sum('amount'),
            'this_month'     => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
            'this_week'      => Payment::whereBetween('payment_date', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('amount'),
        ];

        return Inertia::render('system/Billing/Payments/Index', [
            'payments' => $payments,
            'stats'    => $stats,
            'methods'  => \App\Models\Payment::$methods,
            'filters'  => $request->only(['search', 'method']),
            'company'  => CompanySetting::first(),
        ]);
    }

    public function destroy(Payment $payment)
    {
        $invoice = $payment->invoice;
        $payment->delete();

        // Re-evaluate invoice status after deletion
        if ($invoice) {
            $invoice->refresh();
            $paid  = $invoice->amount_paid;
            $total = (float) $invoice->total;
            $newStatus = match(true) {
                $paid <= 0     => 'sent',
                $paid >= $total => 'paid',
                default        => 'partial',
            };
            if (!in_array($invoice->status, ['draft', 'cancelled', 'overdue'])) {
                $invoice->update(['status' => $newStatus]);
            }
        }

        return back()->with('success', 'Payment deleted.');
    }
}

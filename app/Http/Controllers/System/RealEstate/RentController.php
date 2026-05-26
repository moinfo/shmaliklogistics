<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\RentInvoice;
use App\Models\RentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RentController extends Controller
{
    public function index(Request $request)
    {
        $query = RentInvoice::query()
            ->with(['lease.unit.property', 'tenant'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('invoice_number', 'like', "%{$s}%")
                  ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('lease.unit.property', fn ($p) => $p->where('name', 'like', "%{$s}%"));
            });
        }

        $invoices = $query->paginate(15)->withQueryString();

        $invoices->getCollection()->transform(function (RentInvoice $invoice) {
            $unit     = $invoice->lease?->unit;
            $property = $unit?->property;

            $propertyLabel = $property
                ? trim(($property->name ?? '') . ' — ' . ($unit->unit_number ?? ''))
                : ($unit->unit_number ?? '—');

            return [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'tenant_name'    => $invoice->tenant?->name,
                'property_label' => $propertyLabel,
                'period_start'   => $invoice->period_start,
                'period_end'     => $invoice->period_end,
                'due_date'       => $invoice->due_date,
                'amount'         => (float) $invoice->amount,
                'currency'       => $invoice->currency,
                'status'         => $invoice->status,
                'amount_paid'    => $invoice->amount_paid,
                'balance_due'    => $invoice->balance_due,
            ];
        });

        $today = Carbon::today()->toDateString();

        $totalBilled = (float) RentInvoice::where('status', '!=', 'cancelled')->sum('amount');

        $totalCollected = (float) RentPayment::whereHas('invoice', fn ($q) => $q->where('status', '!=', 'cancelled'))
            ->sum('amount');

        $overdueCount = RentInvoice::where(function ($q) use ($today) {
            $q->where('status', 'overdue')
              ->orWhere(function ($inner) use ($today) {
                  $inner->whereIn('status', ['unpaid', 'partial'])
                        ->whereDate('due_date', '<', $today);
              });
        })->count();

        $stats = [
            'total_billed'    => $totalBilled,
            'total_collected' => $totalCollected,
            'outstanding'     => $totalBilled - $totalCollected,
            'overdue_count'   => $overdueCount,
        ];

        return Inertia::render('system/RealEstate/Rent/Index', [
            'invoices'       => $invoices,
            'stats'          => $stats,
            'statuses'       => RentInvoice::$statuses,
            'paymentMethods' => RentPayment::$methods,
            'filters'        => $request->only(['search', 'status']),
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'month' => 'nullable|date_format:Y-m',
        ]);

        $targetMonthEnd = $request->filled('month')
            ? Carbon::createFromFormat('Y-m', $request->month)->endOfMonth()
            : Carbon::now()->endOfMonth();

        $created = 0;

        $leases = Lease::where('status', 'active')->get();

        foreach ($leases as $lease) {
            $cycle  = Lease::$billingCycles[$lease->billing_cycle] ?? Lease::$billingCycles['monthly'];
            $months = $cycle['months'];

            // Determine where the next period begins.
            $latest = RentInvoice::where('lease_id', $lease->id)
                ->orderByDesc('period_end')
                ->first();

            $periodStart = $latest
                ? Carbon::parse($latest->period_end)->addDay()
                : Carbon::parse($lease->start_date);

            $iterations = 0;

            while ($periodStart->copy()->startOfDay()->lte($targetMonthEnd) && $iterations < 24) {
                $iterations++;

                $periodEnd = $periodStart->copy()->addMonthsNoOverflow($months)->subDay();

                $dueDate = $periodStart->copy();
                if ($lease->payment_day) {
                    $daysInMonth = $periodStart->copy()->daysInMonth;
                    $day = min((int) $lease->payment_day, $daysInMonth);
                    $dueDate = $periodStart->copy()->day($day);
                }

                RentInvoice::create([
                    'invoice_number'   => RentInvoice::nextNumber(),
                    'lease_id'         => $lease->id,
                    'property_unit_id' => $lease->property_unit_id,
                    'tenant_id'        => $lease->tenant_id,
                    'period_start'     => $periodStart->toDateString(),
                    'period_end'       => $periodEnd->toDateString(),
                    'due_date'         => $dueDate->toDateString(),
                    'amount'           => $lease->rent_amount,
                    'currency'         => $lease->rent_currency,
                    'status'           => 'unpaid',
                    'created_by'       => $request->user()?->id,
                ]);

                $created++;

                $periodStart = $periodEnd->copy()->addDay();
            }
        }

        $message = $created > 0
            ? "{$created} rent invoice(s) generated."
            : 'No new rent invoices due.';

        return back()->with('success', $message);
    }

    public function storePayment(Request $request, RentInvoice $invoice)
    {
        $data = $request->validate([
            'amount'           => 'required|numeric|gt:0',
            'payment_date'     => 'required|date',
            'payment_method'   => ['required', Rule::in(array_keys(RentPayment::$methods))],
            'reference_number' => 'nullable|string|max:60',
            'notes'            => 'nullable|string|max:200',
            'receipt'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store("rent/{$invoice->id}", 'public');
        }

        RentPayment::create([
            'rent_invoice_id'  => $invoice->id,
            'lease_id'         => $invoice->lease_id,
            'amount'           => $data['amount'],
            'currency'         => $invoice->currency,
            'payment_date'     => $data['payment_date'],
            'payment_method'   => $data['payment_method'],
            'reference_number' => $data['reference_number'] ?? null,
            'receipt_path'     => $receiptPath,
            'notes'            => $data['notes'] ?? null,
            'created_by'       => $request->user()?->id,
        ]);

        $invoice->refresh()->recalcStatus();

        return back()->with('success', 'Payment recorded.');
    }

    public function destroyPayment(RentPayment $payment)
    {
        $invoice = $payment->invoice;

        $payment->delete();

        $invoice?->refresh()->recalcStatus();

        return back()->with('success', 'Payment removed.');
    }
}
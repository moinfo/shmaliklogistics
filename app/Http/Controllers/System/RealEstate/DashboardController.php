<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\PropertyUnit;
use App\Models\RentInvoice;
use App\Models\RentPayment;
use App\Models\Tenant;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $unitsTotal    = PropertyUnit::count();
        $unitsOccupied = PropertyUnit::where('status', 'occupied')->count();

        $billed    = (float) RentInvoice::where('status', '!=', 'cancelled')->sum('amount');
        $collected = (float) RentPayment::sum('amount');

        $overdueCount = RentInvoice::where(function ($q) {
            $q->where('status', 'overdue')
              ->orWhere(function ($qq) {
                  $qq->whereIn('status', ['unpaid', 'partial'])
                     ->whereDate('due_date', '<', now());
              });
        })->count();

        $stats = [
            'properties_total'    => Property::count(),
            'units_total'         => $unitsTotal,
            'units_occupied'      => $unitsOccupied,
            'units_vacant'        => PropertyUnit::where('status', 'vacant')->count(),
            'occupancy_pct'       => $unitsTotal > 0 ? round($unitsOccupied / $unitsTotal * 100) : 0,
            'tenants_active'      => Tenant::where('status', 'active')->count(),
            'monthly_rent_roll'   => (float) Lease::where('status', 'active')->sum('rent_amount'),
            'rent_collected_month'=> (float) RentPayment::whereYear('payment_date', now()->year)
                                        ->whereMonth('payment_date', now()->month)->sum('amount'),
            'outstanding'         => max(0, $billed - $collected),
            'overdue_count'       => $overdueCount,
            'under_renovation'    => Property::where('status', 'under_renovation')->count(),
            'renovation_spend_ytd'=> (float) PropertyExpense::where('category', 'renovation')
                                        ->whereYear('expense_date', now()->year)->sum('amount_tzs'),
        ];

        // 12-month trend: rent billed vs collected vs property expenses
        $monthlyTrend = collect(range(11, 0))->map(function ($offset) {
            $date = now()->subMonths($offset);
            return [
                'month'     => $date->format('M'),
                'year'      => $date->year,
                'billed'    => (float) RentInvoice::where('status', '!=', 'cancelled')
                                ->whereYear('due_date', $date->year)->whereMonth('due_date', $date->month)->sum('amount'),
                'collected' => (float) RentPayment::whereYear('payment_date', $date->year)
                                ->whereMonth('payment_date', $date->month)->sum('amount'),
                'expenses'  => (float) PropertyExpense::whereYear('expense_date', $date->year)
                                ->whereMonth('expense_date', $date->month)->sum('amount_tzs'),
            ];
        })->values()->all();

        $occupancyByProperty = Property::withCount([
                'units',
                'units as occupied_units_count' => fn ($q) => $q->where('status', 'occupied'),
            ])->orderBy('name')->get()->map(function (Property $p) {
                $roll = (float) Lease::where('status', 'active')
                    ->whereHas('unit', fn ($q) => $q->where('property_id', $p->id))
                    ->sum('rent_amount');
                return [
                    'id'             => $p->id,
                    'name'           => $p->name,
                    'type'           => $p->type,
                    'total_units'    => $p->units_count,
                    'occupied_units' => $p->occupied_units_count,
                    'occupancy_pct'  => $p->units_count > 0 ? round($p->occupied_units_count / $p->units_count * 100) : 0,
                    'monthly_roll'   => $roll,
                ];
            })->values();

        $recentPayments = RentPayment::with(['invoice.unit.property', 'invoice.tenant'])
            ->latest('payment_date')->limit(6)->get()->map(function (RentPayment $pay) {
                $inv = $pay->invoice;
                return [
                    'id'             => $pay->id,
                    'invoice_number' => $inv?->invoice_number,
                    'tenant_name'    => $inv?->tenant?->name,
                    'property_label' => $inv?->unit ? ($inv->unit->property?->name . ' — ' . $inv->unit->unit_number) : null,
                    'amount'         => (float) $pay->amount,
                    'currency'       => $pay->currency,
                    'payment_date'   => $pay->payment_date,
                    'payment_method' => $pay->payment_method,
                ];
            })->values();

        $expiringLeases = Lease::with(['tenant:id,name', 'unit.property'])
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [now()->toDateString(), now()->addDays(60)->toDateString()])
            ->orderBy('end_date')->limit(8)->get()->map(function (Lease $l) {
                return [
                    'id'             => $l->id,
                    'lease_number'   => $l->lease_number,
                    'tenant_name'    => $l->tenant?->name,
                    'property_label' => $l->unit ? ($l->unit->property?->name . ' — ' . $l->unit->unit_number) : null,
                    'end_date'       => $l->end_date,
                    'days_left'      => max(0, (int) now()->startOfDay()->diffInDays(Carbon::parse($l->end_date), false)),
                ];
            })->values();

        // Top tenants by outstanding balance
        $topArrears = RentInvoice::with(['tenant:id,name', 'unit.property', 'payments'])
            ->where('status', '!=', 'cancelled')->get()
            ->map(fn (RentInvoice $inv) => [
                'tenant'   => $inv->tenant?->name ?? '—',
                'property' => $inv->unit ? ($inv->unit->property?->name . ' — ' . $inv->unit->unit_number) : '—',
                'balance'  => (float) $inv->balance_due,
                'due'      => $inv->due_date,
            ])
            ->filter(fn ($r) => $r['balance'] > 0)
            ->groupBy('tenant')
            ->map(function ($rows, $tenant) {
                $oldest = collect($rows)->min('due');
                return [
                    'tenant_name'     => $tenant,
                    'property_label'  => collect($rows)->first()['property'],
                    'outstanding_tzs' => collect($rows)->sum('balance'),
                    'days_overdue'    => $oldest
                        ? max(0, (int) Carbon::parse($oldest)->startOfDay()->diffInDays(now()->startOfDay(), false))
                        : 0,
                ];
            })
            ->sortByDesc('outstanding_tzs')->take(6)->values();

        return Inertia::render('system/RealEstate/Dashboard', compact(
            'stats', 'monthlyTrend', 'occupancyByProperty', 'recentPayments', 'expiringLeases', 'topArrears'
        ));
    }
}
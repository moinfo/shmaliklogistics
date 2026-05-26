<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\RentInvoice;
use App\Models\RentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Profitability per property: billed vs collected rent, expenses, net and occupancy.
     */
    public function profitability(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date',
        ]);

        $from = $request->filled('from') ? Carbon::parse($request->from)->startOfDay() : null;
        $to   = $request->filled('to') ? Carbon::parse($request->to)->endOfDay() : null;

        // Load properties with their units (id only) to map invoices/payments back to a property.
        $properties = Property::with('units:id,property_id,status')->orderBy('name')->get();

        // unit_id => property_id map
        $unitToProperty = [];
        foreach ($properties as $property) {
            foreach ($property->units as $unit) {
                $unitToProperty[$unit->id] = $property->id;
            }
        }

        // Rent billed: sum of invoice amounts (non-cancelled) grouped by unit, filtered by due_date range.
        $billedByUnit = RentInvoice::query()
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('property_unit_id')
            ->when($from, fn ($q) => $q->where('due_date', '>=', $from))
            ->when($to, fn ($q) => $q->where('due_date', '<=', $to))
            ->selectRaw('property_unit_id, SUM(amount) as total')
            ->groupBy('property_unit_id')
            ->pluck('total', 'property_unit_id');

        // Rent collected: sum of payments joined to invoices to resolve the unit, filtered by payment_date range.
        $collectedByUnit = RentPayment::query()
            ->join('rent_invoices', 'rent_payments.rent_invoice_id', '=', 'rent_invoices.id')
            ->whereNotNull('rent_invoices.property_unit_id')
            ->when($from, fn ($q) => $q->where('rent_payments.payment_date', '>=', $from))
            ->when($to, fn ($q) => $q->where('rent_payments.payment_date', '<=', $to))
            ->selectRaw('rent_invoices.property_unit_id as property_unit_id, SUM(rent_payments.amount) as total')
            ->groupBy('rent_invoices.property_unit_id')
            ->pluck('total', 'property_unit_id');

        // Expenses (TZS) grouped by property, filtered by expense_date range.
        $expenseByProperty = PropertyExpense::query()
            ->when($from, fn ($q) => $q->where('expense_date', '>=', $from))
            ->when($to, fn ($q) => $q->where('expense_date', '<=', $to))
            ->selectRaw('property_id, SUM(amount_tzs) as total')
            ->groupBy('property_id')
            ->pluck('total', 'property_id');

        $rows = [];
        $totals = ['rent_collected' => 0.0, 'expense' => 0.0, 'net' => 0.0];

        foreach ($properties as $property) {
            $unitIds = $property->units->pluck('id');

            $billed = 0.0;
            $collected = 0.0;
            foreach ($unitIds as $unitId) {
                $billed += (float) ($billedByUnit[$unitId] ?? 0);
                $collected += (float) ($collectedByUnit[$unitId] ?? 0);
            }

            $expense = (float) ($expenseByProperty[$property->id] ?? 0);
            $net = $collected - $expense;

            $totalUnits = $property->units->count();
            $occupiedUnits = $property->units->where('status', 'occupied')->count();
            $occupancyPct = $totalUnits > 0
                ? round(($occupiedUnits / $totalUnits) * 100, 1)
                : 0.0;

            $rows[] = [
                'id'                  => $property->id,
                'name'                => $property->name,
                'type'                => $property->type,
                'rent_collected_tzs'  => round($collected, 2),
                'rent_billed_tzs'     => round($billed, 2),
                'expense_tzs'         => round($expense, 2),
                'net_tzs'             => round($net, 2),
                'occupancy_pct'       => $occupancyPct,
            ];

            $totals['rent_collected'] += $collected;
            $totals['expense'] += $expense;
            $totals['net'] += $net;
        }

        $totals = [
            'rent_collected' => round($totals['rent_collected'], 2),
            'expense'        => round($totals['expense'], 2),
            'net'            => round($totals['net'], 2),
        ];

        return Inertia::render('system/RealEstate/Reports/Profitability', [
            'rows'    => $rows,
            'totals'  => $totals,
            'filters' => [
                'from' => $request->from,
                'to'   => $request->to,
            ],
        ]);
    }

    /**
     * Occupancy per property: unit counts, occupancy percentage and active-lease monthly roll.
     */
    public function occupancy(Request $request)
    {
        $properties = Property::with('units:id,property_id,status')->orderBy('name')->get();

        // Monthly roll = sum of active lease rent per property (resolved via the unit).
        $rollByUnit = Lease::query()
            ->where('status', 'active')
            ->selectRaw('property_unit_id, SUM(rent_amount) as total')
            ->groupBy('property_unit_id')
            ->pluck('total', 'property_unit_id');

        $rows = [];
        $totals = ['units' => 0, 'occupied' => 0, 'vacant' => 0, 'occupancy_pct' => 0.0];

        foreach ($properties as $property) {
            $totalUnits = $property->units->count();
            $occupiedUnits = $property->units->where('status', 'occupied')->count();
            $vacantUnits = $totalUnits - $occupiedUnits;
            $occupancyPct = $totalUnits > 0
                ? round(($occupiedUnits / $totalUnits) * 100, 1)
                : 0.0;

            $monthlyRoll = 0.0;
            foreach ($property->units as $unit) {
                $monthlyRoll += (float) ($rollByUnit[$unit->id] ?? 0);
            }

            $rows[] = [
                'id'             => $property->id,
                'name'           => $property->name,
                'type'           => $property->type,
                'total_units'    => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'vacant_units'   => $vacantUnits,
                'occupancy_pct'  => $occupancyPct,
                'monthly_roll'   => round($monthlyRoll, 2),
            ];

            $totals['units'] += $totalUnits;
            $totals['occupied'] += $occupiedUnits;
            $totals['vacant'] += $vacantUnits;
        }

        $totals['occupancy_pct'] = $totals['units'] > 0
            ? round(($totals['occupied'] / $totals['units']) * 100, 1)
            : 0.0;

        return Inertia::render('system/RealEstate/Reports/Occupancy', [
            'properties' => $rows,
            'totals'     => $totals,
        ]);
    }

    /**
     * Arrears: outstanding rent per tenant with aging buckets.
     */
    public function arrears(Request $request)
    {
        $today = Carbon::today();

        // All non-cancelled invoices with their payments + tenant/unit/property labels.
        $invoices = RentInvoice::query()
            ->where('status', '!=', 'cancelled')
            ->with([
                'payments:id,rent_invoice_id,amount',
                'tenant:id,name',
                'lease:id,lease_number',
                'unit:id,unit_number,property_id',
                'unit.property:id,name',
            ])
            ->get();

        // Group outstanding invoices by tenant (fallback to lease when tenant missing).
        $groups = [];
        $aging = ['d0_30' => 0.0, 'd31_60' => 0.0, 'd61_90' => 0.0, 'd90_plus' => 0.0];
        $totalOutstanding = 0.0;

        foreach ($invoices as $invoice) {
            $paid = (float) $invoice->payments->sum('amount');
            $balance = (float) $invoice->amount - $paid;

            if ($balance <= 0) {
                continue;
            }

            $totalOutstanding += $balance;

            $dueDate = $invoice->due_date ? Carbon::parse($invoice->due_date) : null;
            $daysOverdue = $dueDate ? max(0, $today->diffInDays($dueDate, false) * -1) : 0;

            // Aging bucket by this invoice's days overdue.
            if ($daysOverdue <= 30) {
                $aging['d0_30'] += $balance;
            } elseif ($daysOverdue <= 60) {
                $aging['d31_60'] += $balance;
            } elseif ($daysOverdue <= 90) {
                $aging['d61_90'] += $balance;
            } else {
                $aging['d90_plus'] += $balance;
            }

            $tenantName = $invoice->tenant?->name ?? 'Unknown';
            $unit = $invoice->unit;
            $propertyName = $unit?->property?->name;
            $unitNumber = $unit?->unit_number;
            $propertyLabel = $propertyName
                ? trim($propertyName . ($unitNumber ? " — {$unitNumber}" : ''))
                : ($unitNumber ?? '—');

            // Key groups by tenant when available, else by lease.
            $key = $invoice->tenant_id
                ? 'tenant_' . $invoice->tenant_id
                : 'lease_' . $invoice->lease_id;

            if (! isset($groups[$key])) {
                $groups[$key] = [
                    'tenant_name'     => $tenantName,
                    'property_label'  => $propertyLabel,
                    'lease_number'    => $invoice->lease?->lease_number,
                    'outstanding_tzs' => 0.0,
                    'oldest_due_date' => $dueDate,
                ];
            }

            $groups[$key]['outstanding_tzs'] += $balance;

            if ($dueDate && (! $groups[$key]['oldest_due_date'] || $dueDate->lt($groups[$key]['oldest_due_date']))) {
                $groups[$key]['oldest_due_date'] = $dueDate;
            }
        }

        $rows = [];
        foreach ($groups as $group) {
            $oldest = $group['oldest_due_date'];
            $daysOverdue = $oldest ? max(0, $today->diffInDays($oldest, false) * -1) : 0;

            $rows[] = [
                'tenant_name'     => $group['tenant_name'],
                'property_label'  => $group['property_label'],
                'lease_number'    => $group['lease_number'],
                'outstanding_tzs' => round($group['outstanding_tzs'], 2),
                'oldest_due_date' => $oldest ? $oldest->toDateString() : null,
                'days_overdue'    => (int) $daysOverdue,
            ];
        }

        // Largest outstanding first.
        usort($rows, fn ($a, $b) => $b['outstanding_tzs'] <=> $a['outstanding_tzs']);

        return Inertia::render('system/RealEstate/Reports/Arrears', [
            'rows'              => $rows,
            'total_outstanding' => round($totalOutstanding, 2),
            'aging'             => [
                'd0_30'    => round($aging['d0_30'], 2),
                'd31_60'   => round($aging['d31_60'], 2),
                'd61_90'   => round($aging['d61_90'], 2),
                'd90_plus' => round($aging['d90_plus'], 2),
            ],
        ]);
    }
}
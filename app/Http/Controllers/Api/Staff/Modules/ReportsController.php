<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Concerns\UsesDateExtract;
use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Read-only analytics endpoints for the staff mobile app.
 *
 * Mirrors the aggregation queries of the System\RouteProfitabilityController,
 * FinancialSummaryController and FleetUtilizationController but returns flat
 * JSON envelopes ({ "report": { summary..., rows: [...] } }) instead of Inertia
 * pages. Auth + permission scoping is handled by route middleware.
 */
class ReportsController extends Controller
{
    use UsesDateExtract;

    // GET /api/staff/modules/reports/route-profitability
    public function routeProfitability(Request $request): JsonResponse
    {
        $year  = (int) $request->get('year', now()->year);
        $month = $request->get('month', '');

        $query = Trip::query()
            ->whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year);

        if ($month) {
            $query->whereMonth('departure_date', $month);
        }

        // Per-route rows. Clone the base query so the selectRaw/orderBy below
        // don't leak into the summary aggregates.
        $rows = (clone $query)
            ->selectRaw("
                route_from,
                route_to,
                COUNT(*) as trip_count,
                SUM(freight_amount) as total_revenue,
                SUM(fuel_cost + driver_allowance + border_costs + other_costs) as total_costs,
                SUM(freight_amount - fuel_cost - driver_allowance - border_costs - other_costs) as total_profit,
                AVG(freight_amount) as avg_revenue,
                AVG(fuel_cost + driver_allowance + border_costs + other_costs) as avg_costs,
                SUM(cargo_weight_tons) as total_cargo_tons
            ")
            ->groupBy('route_from', 'route_to')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(fn ($r) => [
                'route_from'       => $r->route_from,
                'route_to'         => $r->route_to,
                'trip_count'       => (int) $r->trip_count,
                'total_revenue'    => (float) $r->total_revenue,
                'total_costs'      => (float) $r->total_costs,
                'total_profit'     => (float) $r->total_profit,
                'avg_revenue'      => (float) $r->avg_revenue,
                'avg_costs'        => (float) $r->avg_costs,
                'total_cargo_tons' => (float) $r->total_cargo_tons,
                'margin'           => $r->total_revenue > 0
                    ? round($r->total_profit / $r->total_revenue * 100, 1)
                    : 0,
            ]);

        $totalRevenue = (float) (clone $query)->sum('freight_amount');
        $totalProfit  = (float) (clone $query)->sum(DB::raw('freight_amount - fuel_cost - driver_allowance - border_costs - other_costs'));

        $report = [
            'year'          => $year,
            'month'         => $month !== '' ? (int) $month : null,
            'total_trips'   => (clone $query)->count(),
            'total_revenue' => $totalRevenue,
            'total_costs'   => (float) (clone $query)->sum(DB::raw('fuel_cost + driver_allowance + border_costs + other_costs')),
            'total_profit'  => $totalProfit,
            'margin'        => $totalRevenue > 0 ? round($totalProfit / $totalRevenue * 100, 1) : 0,
            'route_count'   => $rows->count(),
            'rows'          => $rows->values(),
        ];

        return response()->json(['report' => $report]);
    }

    // GET /api/staff/modules/reports/financial-summary
    public function financialSummary(Request $request): JsonResponse
    {
        $year  = (int) $request->get('year', now()->year);
        $month = $request->get('month', '');

        // Monthly revenue from payments
        $revenueQuery = Payment::whereYear('payment_date', $year);
        if ($month) {
            $revenueQuery->whereMonth('payment_date', $month);
        }
        $monthlyRevenue = (clone $revenueQuery)
            ->selectRaw("{$this->monthExpr('payment_date')} as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Monthly expenses (TZS only)
        $expenseQuery = Expense::where('currency', 'TZS')->whereYear('expense_date', $year);
        if ($month) {
            $expenseQuery->whereMonth('expense_date', $month);
        }
        $monthlyExpenses = (clone $expenseQuery)
            ->selectRaw("{$this->monthExpr('expense_date')} as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Maintenance costs (TZS)
        $maintenanceCosts = DB::table('service_records')
            ->where('currency', 'TZS')
            ->whereYear('service_date', $year)
            ->when($month, fn ($q) => $q->whereMonth('service_date', $month))
            ->selectRaw("{$this->monthExpr('service_date')} as month, SUM(cost) as total")
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Build 12-month rows
        $rows = [];
        for ($m = 1; $m <= 12; $m++) {
            $rev = (float) ($monthlyRevenue[$m]->total ?? 0);
            $exp = (float) ($monthlyExpenses[$m]->total ?? 0);
            $mnt = (float) ($maintenanceCosts[$m]->total ?? 0);
            $rows[] = [
                'month'       => $m,
                'revenue'     => $rev,
                'expenses'    => $exp,
                'maintenance' => $mnt,
                'total_costs' => $exp + $mnt,
                'profit'      => $rev - $exp - $mnt,
            ];
        }

        $totalRevenue     = array_sum(array_column($rows, 'revenue'));
        $totalExpenses    = array_sum(array_column($rows, 'expenses'));
        $totalMaintenance = array_sum(array_column($rows, 'maintenance'));
        $totalProfit      = $totalRevenue - $totalExpenses - $totalMaintenance;

        // Outstanding invoices
        $outstandingIds = BillingDocument::where('type', 'invoice')
            ->whereIn('status', ['sent', 'partial'])
            ->pluck('id');
        $outstandingBilled   = (float) BillingDocument::whereIn('id', $outstandingIds)->sum('total');
        $outstandingReceived = (float) Payment::whereIn('billing_document_id', $outstandingIds)->sum('amount');

        $report = [
            'year'              => $year,
            'month'             => $month !== '' ? (int) $month : null,
            'total_revenue'     => $totalRevenue,
            'total_expenses'    => $totalExpenses,
            'total_maintenance' => $totalMaintenance,
            'total_costs'       => $totalExpenses + $totalMaintenance,
            'total_profit'      => $totalProfit,
            'margin'            => $totalRevenue > 0 ? round($totalProfit / $totalRevenue * 100, 1) : 0,
            'outstanding_billed'   => $outstandingBilled,
            'outstanding_received' => $outstandingReceived,
            'outstanding_balance'  => $outstandingBilled - $outstandingReceived,
            'rows'              => $rows,
        ];

        return response()->json(['report' => $report]);
    }

    // GET /api/staff/modules/reports/fleet-utilization
    public function fleetUtilization(Request $request): JsonResponse
    {
        $year  = (int) $request->get('year', now()->year);
        $month = $request->get('month', '');

        $tripQuery = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year);
        if ($month) {
            $tripQuery->whereMonth('departure_date', $month);
        }

        $rows = (clone $tripQuery)
            ->selectRaw("
                vehicle_plate,
                COUNT(*) as trip_count,
                SUM(freight_amount) as total_revenue,
                SUM(fuel_cost + driver_allowance + border_costs + other_costs) as total_costs,
                SUM(freight_amount - fuel_cost - driver_allowance - border_costs - other_costs) as total_profit,
                SUM(cargo_weight_tons) as total_cargo_tons,
                AVG(freight_amount) as avg_revenue_per_trip
            ")
            ->groupBy('vehicle_plate')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(fn ($r) => [
                'vehicle_plate'        => $r->vehicle_plate,
                'trip_count'           => (int) $r->trip_count,
                'total_revenue'        => (float) $r->total_revenue,
                'total_costs'          => (float) $r->total_costs,
                'total_profit'         => (float) $r->total_profit,
                'total_cargo_tons'     => (float) $r->total_cargo_tons,
                'avg_revenue_per_trip' => (float) $r->avg_revenue_per_trip,
            ]);

        $totalFleet     = Vehicle::whereNotIn('status', ['retired'])->count();
        $activeVehicles = $rows->count();

        $report = [
            'year'             => $year,
            'month'            => $month !== '' ? (int) $month : null,
            'total_trips'      => (int) $rows->sum('trip_count'),
            'total_revenue'    => (float) $rows->sum('total_revenue'),
            'total_fleet'      => $totalFleet,
            'active_vehicles'  => $activeVehicles,
            'idle_vehicles'    => max(0, $totalFleet - $activeVehicles),
            'utilization_rate' => $totalFleet > 0
                ? round($activeVehicles / $totalFleet * 100, 1)
                : 0,
            'rows'             => $rows->values(),
        ];

        return response()->json(['report' => $report]);
    }
}

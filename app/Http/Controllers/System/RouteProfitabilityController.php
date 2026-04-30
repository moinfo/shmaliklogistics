<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RouteProfitabilityController extends Controller
{
    public function index(Request $request)
    {
        $year  = $request->get('year', now()->year);
        $month = $request->get('month', '');

        $query = Trip::query()
            ->whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year);

        if ($month) {
            $query->whereMonth('departure_date', $month);
        }

        // Group by route
        $routes = $query
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
            ->get();

        // Overall summary
        $summary = [
            'total_trips'   => $query->count(),
            'total_revenue' => $query->sum('freight_amount'),
            'total_costs'   => $query->sum(DB::raw('fuel_cost + driver_allowance + border_costs + other_costs')),
            'total_profit'  => $query->sum(DB::raw('freight_amount - fuel_cost - driver_allowance - border_costs - other_costs')),
        ];
        $summary['margin'] = $summary['total_revenue'] > 0
            ? round($summary['total_profit'] / $summary['total_revenue'] * 100, 1)
            : 0;

        // Monthly trend for the year
        $monthly = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year)
            ->selectRaw("
                MONTH(departure_date) as month,
                COUNT(*) as trips,
                SUM(freight_amount) as revenue,
                SUM(fuel_cost + driver_allowance + border_costs + other_costs) as costs,
                SUM(freight_amount - fuel_cost - driver_allowance - border_costs - other_costs) as profit
            ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top drivers by revenue
        $drivers = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year)
            ->selectRaw("driver_name, COUNT(*) as trips, SUM(freight_amount) as revenue, SUM(freight_amount - fuel_cost - driver_allowance - border_costs - other_costs) as profit")
            ->groupBy('driver_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $availableYears = Trip::selectRaw('YEAR(departure_date) as year')
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        return Inertia::render('system/Reports/RouteProfitability', [
            'routes'         => $routes,
            'summary'        => $summary,
            'monthly'        => $monthly,
            'drivers'        => $drivers,
            'year'           => (int) $year,
            'month'          => $month,
            'availableYears' => $availableYears,
        ]);
    }
}

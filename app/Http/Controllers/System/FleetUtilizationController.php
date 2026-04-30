<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetUtilizationController extends Controller
{
    public function index(Request $request)
    {
        $year  = $request->get('year', now()->year);
        $month = $request->get('month', '');

        $tripQuery = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year);
        if ($month) $tripQuery->whereMonth('departure_date', $month);

        // Per-vehicle stats
        $vehicleStats = (clone $tripQuery)
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
            ->get();

        // Fleet totals
        $totalTrips   = $vehicleStats->sum('trip_count');
        $totalRevenue = $vehicleStats->sum('total_revenue');
        $totalFleet   = Vehicle::whereNotIn('status', ['retired'])->count();

        // Active vehicles (had at least 1 trip)
        $activeVehicles = $vehicleStats->count();

        // Monthly breakdown (trips + revenue)
        $monthly = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year)
            ->selectRaw('MONTH(departure_date) as month, COUNT(*) as trips, SUM(freight_amount) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $availableYears = Trip::selectRaw('YEAR(departure_date) as year')
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        return Inertia::render('system/Reports/FleetUtilization', [
            'vehicleStats'   => $vehicleStats,
            'monthly'        => $monthly,
            'totalTrips'     => $totalTrips,
            'totalRevenue'   => $totalRevenue,
            'totalFleet'     => $totalFleet,
            'activeVehicles' => $activeVehicles,
            'year'           => (int) $year,
            'month'          => $month,
            'availableYears' => $availableYears,
        ]);
    }
}

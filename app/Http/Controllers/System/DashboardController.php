<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\Trip;
use App\Models\Vehicle;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $monthRevenue     = (float) Trip::whereMonth('departure_date', now()->month)
            ->whereYear('departure_date', now()->year)
            ->sum('freight_amount');
        $lastMonthRevenue = (float) Trip::whereMonth('departure_date', now()->subMonth()->month)
            ->whereYear('departure_date', now()->subMonth()->year)
            ->sum('freight_amount');

        $stats = [
            'active_trips'        => Trip::whereIn('status', ['loading', 'in_transit', 'at_border'])->count(),
            'fleet_total'         => Vehicle::count(),
            'fleet_on_road'       => Vehicle::whereIn('status', ['on_road', 'at_border', 'loading'])->count(),
            'fleet_idle'          => Vehicle::where('status', 'idle')->count(),
            'month_revenue'       => $monthRevenue,
            'last_month_revenue'  => $lastMonthRevenue,
            'revenue_change_pct'  => $lastMonthRevenue > 0
                ? round(($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue * 100, 1)
                : null,
            'pending_permits'     => Permit::where('expiry_date', '>=', now())
                ->where('expiry_date', '<=', now()->addDays(30))
                ->count(),
            'permits_expiring_7d' => Permit::where('expiry_date', '>=', now())
                ->where('expiry_date', '<=', now()->addDays(7))
                ->count(),
        ];

        $recentTrips = Trip::latest()
            ->limit(5)
            ->get(['trip_number', 'route_from', 'route_to', 'driver_name', 'vehicle_plate', 'status', 'cargo_description']);

        $fleetStatus = Vehicle::with('driver:id,name')
            ->latest()
            ->limit(6)
            ->get(['id', 'plate', 'type', 'status', 'driver_id']);

        return Inertia::render('system/Dashboard', compact('stats', 'recentTrips', 'fleetStatus'));
    }
}

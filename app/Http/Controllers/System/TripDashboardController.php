<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TripDashboardController extends Controller
{
    public function __invoke()
    {
        $costColumns = ['fuel_cost', 'driver_allowance', 'border_costs', 'road_fines', 'guard_fees', 'other_costs'];
        $costSumSql  = implode(' + ', array_map(fn ($c) => "COALESCE($c, 0)", $costColumns));

        $monthRevenue = (float) Trip::whereMonth('departure_date', now()->month)
            ->whereYear('departure_date', now()->year)
            ->sum('freight_amount');
        $lastMonthRevenue = (float) Trip::whereMonth('departure_date', now()->subMonth()->month)
            ->whereYear('departure_date', now()->subMonth()->year)
            ->sum('freight_amount');

        $completedStatuses = ['completed', 'delivered'];

        // Total profit over completed/delivered trips this year: SUM(freight) - SUM(all cost columns).
        $profitRow = Trip::whereIn('status', $completedStatuses)
            ->whereYear('departure_date', now()->year)
            ->selectRaw('COALESCE(SUM(freight_amount), 0) as freight, COALESCE(SUM(' . $costSumSql . '), 0) as costs')
            ->first();
        $totalProfit = (float) $profitRow->freight - (float) $profitRow->costs;

        $totalTrips = Trip::count();

        $stats = [
            'total'              => $totalTrips,
            'active'             => Trip::whereIn('status', ['loading', 'in_transit', 'at_border'])->count(),
            'completed'          => Trip::whereIn('status', $completedStatuses)->count(),
            'cancelled'          => Trip::where('status', 'cancelled')->count(),
            'month_revenue'      => $monthRevenue,
            'last_month_revenue' => $lastMonthRevenue,
            'revenue_change_pct' => $lastMonthRevenue > 0
                ? round(($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue * 100, 1)
                : null,
            'total_profit'       => $totalProfit,
            'avg_freight'        => $totalTrips > 0
                ? round((float) Trip::avg('freight_amount'), 2)
                : 0,
        ];

        $statuses = Trip::$statuses;

        // Status breakdown — only statuses with at least one trip.
        $counts = Trip::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $statusBreakdown = collect($statuses)
            ->map(fn ($meta, $key) => [
                'status' => $key,
                'label'  => $meta['label'],
                'color'  => $meta['color'],
                'count'  => (int) ($counts[$key] ?? 0),
            ])
            ->filter(fn ($row) => $row['count'] > 0)
            ->values()
            ->all();

        // 12-month trend: trips, revenue, costs, profit.
        $monthlyTrend = collect(range(11, 0))->map(function ($offset) use ($costSumSql) {
            $date  = now()->subMonths($offset);
            $year  = $date->year;
            $month = $date->month;

            $row = Trip::whereYear('departure_date', $year)
                ->whereMonth('departure_date', $month)
                ->selectRaw('COUNT(*) as trips, COALESCE(SUM(freight_amount), 0) as revenue, COALESCE(SUM(' . $costSumSql . '), 0) as costs')
                ->first();

            $revenue = (float) $row->revenue;
            $costs   = (float) $row->costs;

            return [
                'month'   => $date->format('M'),
                'year'    => $year,
                'trips'   => (int) $row->trips,
                'revenue' => $revenue,
                'costs'   => $costs,
                'profit'  => $revenue - $costs,
            ];
        })->values()->all();

        // Top 6 routes by trip count.
        $topRoutes = Trip::select(
            'route_from',
            'route_to',
            DB::raw('COUNT(*) as trips'),
            DB::raw('COALESCE(SUM(freight_amount), 0) as revenue')
        )
            ->groupBy('route_from', 'route_to')
            ->orderByDesc('trips')
            ->limit(6)
            ->get()
            ->map(fn ($r) => [
                'route'   => $r->route_from . ' → ' . $r->route_to,
                'trips'   => (int) $r->trips,
                'revenue' => (float) $r->revenue,
            ])
            ->all();

        $recentTrips = Trip::latest()
            ->limit(6)
            ->get(['id', 'trip_number', 'route_from', 'route_to', 'driver_name', 'vehicle_plate', 'status', 'freight_amount', 'departure_date']);

        return Inertia::render('system/Trips/Dashboard', compact(
            'stats',
            'statuses',
            'statusBreakdown',
            'monthlyTrend',
            'topRoutes',
            'recentTrips'
        ));
    }
}
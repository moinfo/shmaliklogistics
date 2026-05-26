<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenanceDashboardController extends Controller
{
    public function __invoke()
    {
        $today = now()->startOfDay();

        $monthCost = (float) ServiceRecord::whereMonth('service_date', now()->month)
            ->whereYear('service_date', now()->year)
            ->sum('cost');
        $ytdCost = (float) ServiceRecord::whereYear('service_date', now()->year)
            ->sum('cost');

        $stats = [
            'total_services' => ServiceRecord::count(),
            'month_cost'     => $monthCost,
            'ytd_cost'       => $ytdCost,
            'upcoming_count' => ServiceRecord::whereNotNull('next_service_date')
                ->whereBetween('next_service_date', [$today, $today->copy()->addDays(30)])
                ->count(),
            'overdue_count'  => ServiceRecord::whereNotNull('next_service_date')
                ->where('next_service_date', '<', $today)
                ->count(),
            'avg_cost'       => (float) ServiceRecord::avg('cost'),
        ];

        // 12-month maintenance cost trend
        $monthlyTrend = collect(range(11, 0))->map(function ($offset) {
            $date  = now()->subMonths($offset);
            $year  = $date->year;
            $month = $date->month;
            $cost  = (float) ServiceRecord::whereYear('service_date', $year)
                ->whereMonth('service_date', $month)
                ->sum('cost');
            $count = ServiceRecord::whereYear('service_date', $year)
                ->whereMonth('service_date', $month)
                ->count();
            return [
                'month' => $date->format('M'),
                'year'  => $year,
                'cost'  => $cost,
                'count' => $count,
            ];
        })->values()->all();

        // Cost by service type (top 8)
        $byType = ServiceRecord::select('service_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(cost) as cost'))
            ->groupBy('service_type')
            ->orderByDesc('cost')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'type'  => $r->service_type,
                'count' => (int) $r->count,
                'cost'  => (float) $r->cost,
            ])
            ->values()
            ->all();

        // Upcoming services (next_service_date >= today)
        $upcomingServices = ServiceRecord::with('vehicle:id,plate')
            ->whereNotNull('next_service_date')
            ->where('next_service_date', '>=', $today)
            ->orderBy('next_service_date')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'id'                => $r->id,
                'vehicle_plate'     => $r->vehicle?->plate,
                'service_type'      => $r->service_type,
                'next_service_date' => optional($r->next_service_date)->toDateString(),
                'days_left'         => $r->next_service_date
                    ? (int) round($today->diffInDays($r->next_service_date->startOfDay(), false))
                    : null,
            ])
            ->values()
            ->all();

        // Recent services (latest 6 by service_date)
        $recentServices = ServiceRecord::with('vehicle:id,plate')
            ->orderByDesc('service_date')
            ->limit(6)
            ->get()
            ->map(fn ($r) => [
                'id'            => $r->id,
                'vehicle_plate' => $r->vehicle?->plate,
                'service_type'  => $r->service_type,
                'cost'          => (float) $r->cost,
                'currency'      => $r->currency,
                'service_date'  => optional($r->service_date)->toDateString(),
                'workshop_name' => $r->workshop_name,
            ])
            ->values()
            ->all();

        // Top vehicles by total maintenance cost (top 6)
        $topVehicles = ServiceRecord::select(
                'vehicle_id',
                DB::raw('COUNT(*) as services_count'),
                DB::raw('SUM(cost) as total_cost')
            )
            ->with('vehicle:id,plate')
            ->groupBy('vehicle_id')
            ->orderByDesc('total_cost')
            ->limit(6)
            ->get()
            ->map(fn ($r) => [
                'vehicle_plate'  => $r->vehicle?->plate,
                'services_count' => (int) $r->services_count,
                'total_cost'     => (float) $r->total_cost,
            ])
            ->values()
            ->all();

        return Inertia::render('system/Maintenance/Dashboard', compact(
            'stats',
            'monthlyTrend',
            'byType',
            'upcomingServices',
            'recentServices',
            'topVehicles'
        ));
    }
}
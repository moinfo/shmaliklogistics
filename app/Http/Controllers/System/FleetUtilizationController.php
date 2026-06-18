<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Concerns\UsesDateExtract;
use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetUtilizationController extends Controller
{
    use UsesDateExtract;

    public function index(Request $request)
    {
        return Inertia::render('system/Reports/FleetUtilization', $this->compute($request));
    }

    public function export(Request $request)
    {
        $d = $this->compute($request);
        $scope = 'Year ' . $d['year'] . ($d['month'] ? ' · Month ' . $d['month'] : ' · All months');
        $suffix = $d['year'] . ($d['month'] ? '-' . $d['month'] : '');
        $totalRevenue = (float) $d['totalRevenue'];
        $utilisation = $d['totalFleet'] > 0 ? round($d['activeVehicles'] / $d['totalFleet'] * 100, 1) : 0;

        $report = [
            'title'    => 'Fleet Utilization',
            'subtitle' => $scope,
            'filename' => 'fleet-utilization-' . $suffix,
            'summary'  => [
                'Total Trips'         => $d['totalTrips'],
                'Total Revenue (TZS)' => $d['totalRevenue'],
                'Fleet Size'          => $d['totalFleet'],
                'Active Vehicles'     => $d['activeVehicles'],
                'Utilization %'       => $utilisation,
            ],
            'sections' => [
                [
                    'heading' => 'Per-Vehicle Performance',
                    'columns' => [
                        ['label' => 'Vehicle',          'key' => 'plate',  'type' => 'text'],
                        ['label' => 'Trips',            'key' => 'trips',  'type' => 'int'],
                        ['label' => 'Revenue (TZS)',    'key' => 'rev',    'type' => 'money'],
                        ['label' => 'Costs (TZS)',      'key' => 'cost',   'type' => 'money'],
                        ['label' => 'Profit (TZS)',     'key' => 'profit', 'type' => 'money'],
                        ['label' => 'Avg Rev/Trip (TZS)','key' => 'avg',   'type' => 'money'],
                        ['label' => 'Cargo (t)',        'key' => 'tons',   'type' => 'tons'],
                        ['label' => 'Rev Share %',      'key' => 'share',  'type' => 'percent'],
                    ],
                    'rows' => collect($d['vehicleStats'])->map(fn ($v) => [
                        'plate'  => $v->vehicle_plate ?: '—',
                        'trips'  => $v->trip_count,
                        'rev'    => $v->total_revenue,
                        'cost'   => $v->total_costs,
                        'profit' => $v->total_profit,
                        'avg'    => $v->avg_revenue_per_trip,
                        'tons'   => $v->total_cargo_tons,
                        'share'  => $totalRevenue > 0 ? round($v->total_revenue / $totalRevenue * 100, 1) : 0,
                    ])->all(),
                ],
                [
                    'heading' => 'Monthly Activity',
                    'columns' => [
                        ['label' => 'Month',         'key' => 'month', 'type' => 'text'],
                        ['label' => 'Trips',         'key' => 'trips', 'type' => 'int'],
                        ['label' => 'Revenue (TZS)', 'key' => 'rev',   'type' => 'money'],
                    ],
                    'rows' => collect($d['monthly'])->map(fn ($m) => [
                        'month' => self::monthName((int) $m->month),
                        'trips' => $m->trips,
                        'rev'   => $m->revenue,
                    ])->all(),
                ],
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
    }

    private static function monthName(int $m): string
    {
        return $m >= 1 && $m <= 12
            ? \Carbon\Carbon::create(null, $m, 1)->format('F')
            : (string) $m;
    }

    private function compute(Request $request): array
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
            ->selectRaw("{$this->monthExpr('departure_date')} as month, COUNT(*) as trips, SUM(freight_amount) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $availableYears = Trip::selectRaw("{$this->yearExpr('departure_date')} as year")
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        return [
            'vehicleStats'   => $vehicleStats,
            'monthly'        => $monthly,
            'totalTrips'     => $totalTrips,
            'totalRevenue'   => $totalRevenue,
            'totalFleet'     => $totalFleet,
            'activeVehicles' => $activeVehicles,
            'year'           => (int) $year,
            'month'          => $month,
            'availableYears' => $availableYears,
        ];
    }
}

<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Concerns\UsesDateExtract;
use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RouteProfitabilityController extends Controller
{
    use UsesDateExtract;

    public function index(Request $request)
    {
        return Inertia::render('system/Reports/RouteProfitability', $this->compute($request));
    }

    public function export(Request $request)
    {
        $d = $this->compute($request);
        $scope = 'Year ' . $d['year'] . ($d['month'] ? ' · Month ' . $d['month'] : ' · All months');
        $suffix = $d['year'] . ($d['month'] ? '-' . $d['month'] : '');

        $report = [
            'title'    => 'Route Profitability',
            'subtitle' => $scope,
            'filename' => 'route-profitability-' . $suffix,
            'summary'  => [
                'Total Trips'   => $d['summary']['total_trips'],
                'Total Revenue (TZS)' => $d['summary']['total_revenue'],
                'Total Costs (TZS)'   => $d['summary']['total_costs'],
                'Total Profit (TZS)'  => $d['summary']['total_profit'],
                'Profit Margin %'     => $d['summary']['margin'],
            ],
            'sections' => [
                [
                    'heading' => 'Profit by Route',
                    'columns' => [
                        ['label' => 'Route',          'key' => 'route',  'type' => 'text'],
                        ['label' => 'Trips',          'key' => 'trips',  'type' => 'int'],
                        ['label' => 'Revenue (TZS)',  'key' => 'rev',    'type' => 'money'],
                        ['label' => 'Costs (TZS)',    'key' => 'cost',   'type' => 'money'],
                        ['label' => 'Profit (TZS)',   'key' => 'profit', 'type' => 'money'],
                        ['label' => 'Margin %',       'key' => 'margin', 'type' => 'percent'],
                        ['label' => 'Avg Rev (TZS)',  'key' => 'avg',    'type' => 'money'],
                        ['label' => 'Cargo (t)',      'key' => 'tons',   'type' => 'tons'],
                    ],
                    'rows' => collect($d['routes'])->map(fn ($r) => [
                        'route'  => $r->route_from . ' → ' . $r->route_to,
                        'trips'  => $r->trip_count,
                        'rev'    => $r->total_revenue,
                        'cost'   => $r->total_costs,
                        'profit' => $r->total_profit,
                        'margin' => $r->total_revenue > 0 ? round($r->total_profit / $r->total_revenue * 100, 1) : 0,
                        'avg'    => $r->avg_revenue,
                        'tons'   => $r->total_cargo_tons,
                    ])->all(),
                ],
                [
                    'heading' => 'Top Drivers by Revenue',
                    'columns' => [
                        ['label' => 'Driver',        'key' => 'driver', 'type' => 'text'],
                        ['label' => 'Trips',         'key' => 'trips',  'type' => 'int'],
                        ['label' => 'Revenue (TZS)', 'key' => 'rev',    'type' => 'money'],
                        ['label' => 'Profit (TZS)',  'key' => 'profit', 'type' => 'money'],
                    ],
                    'rows' => collect($d['drivers'])->map(fn ($r) => [
                        'driver' => $r->driver_name ?: '—',
                        'trips'  => $r->trips,
                        'rev'    => $r->revenue,
                        'profit' => $r->profit,
                    ])->all(),
                ],
                [
                    'heading' => 'Monthly Trend',
                    'columns' => [
                        ['label' => 'Month',         'key' => 'month',  'type' => 'text'],
                        ['label' => 'Trips',         'key' => 'trips',  'type' => 'int'],
                        ['label' => 'Revenue (TZS)', 'key' => 'rev',    'type' => 'money'],
                        ['label' => 'Costs (TZS)',   'key' => 'cost',   'type' => 'money'],
                        ['label' => 'Profit (TZS)',  'key' => 'profit', 'type' => 'money'],
                    ],
                    'rows' => collect($d['monthly'])->map(fn ($r) => [
                        'month'  => self::monthName((int) $r->month),
                        'trips'  => $r->trips,
                        'rev'    => $r->revenue,
                        'cost'   => $r->costs,
                        'profit' => $r->profit,
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

        $query = Trip::query()
            ->whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year);

        if ($month) {
            $query->whereMonth('departure_date', $month);
        }

        // Group by route — clone so selectRaw/orderBy don't leak into the
        // summary aggregates below (count/sum would inherit the order-by
        // alias and fail with "Unknown column 'total_revenue'").
        $routes = (clone $query)
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
            'total_trips'   => (clone $query)->count(),
            'total_revenue' => (clone $query)->sum('freight_amount'),
            'total_costs'   => (clone $query)->sum(DB::raw('fuel_cost + driver_allowance + border_costs + other_costs')),
            'total_profit'  => (clone $query)->sum(DB::raw('freight_amount - fuel_cost - driver_allowance - border_costs - other_costs')),
        ];
        $summary['margin'] = $summary['total_revenue'] > 0
            ? round($summary['total_profit'] / $summary['total_revenue'] * 100, 1)
            : 0;

        // Monthly trend for the year
        $monthly = Trip::whereIn('status', ['delivered', 'completed'])
            ->whereYear('departure_date', $year)
            ->selectRaw("
                {$this->monthExpr('departure_date')} as month,
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

        $availableYears = Trip::selectRaw("{$this->yearExpr('departure_date')} as year")
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        return [
            'routes'         => $routes,
            'summary'        => $summary,
            'monthly'        => $monthly,
            'drivers'        => $drivers,
            'year'           => (int) $year,
            'month'          => $month,
            'availableYears' => $availableYears,
        ];
    }
}

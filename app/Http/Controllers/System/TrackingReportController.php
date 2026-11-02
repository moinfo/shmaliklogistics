<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\GpsEvent;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use App\Support\ReportExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** GPS mileage and driver-behaviour report, one row per vehicle. */
class TrackingReportController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('system/Fleet/TrackingReport', $this->compute($request));
    }

    public function export(Request $request)
    {
        $d = $this->compute($request);

        $report = [
            'title'    => 'GPS Mileage & Driver Behaviour',
            'subtitle' => "{$d['from']} to {$d['to']}",
            'filename' => "gps-mileage-{$d['from']}-{$d['to']}",
            'summary'  => [
                'Vehicles tracked' => count($d['rows']),
                'Total GPS km'     => $d['totals']['km'],
                'Speeding alerts'  => $d['totals']['speeding'],
                'Harsh driving'    => $d['totals']['harsh'],
            ],
            'sections' => [[
                'heading' => 'Per vehicle',
                'columns' => [
                    ['label' => 'Vehicle',         'key' => 'plate',    'type' => 'text'],
                    ['label' => 'Driver',          'key' => 'driver',   'type' => 'text'],
                    ['label' => 'GPS km',          'key' => 'km',       'type' => 'tons'],
                    ['label' => 'Active days',     'key' => 'days',     'type' => 'int'],
                    ['label' => 'Max km/h',        'key' => 'max',      'type' => 'int'],
                    ['label' => 'Avg moving km/h', 'key' => 'avg',      'type' => 'int'],
                    ['label' => 'Speeding',        'key' => 'speeding', 'type' => 'int'],
                    ['label' => 'Harsh',           'key' => 'harsh',    'type' => 'int'],
                    ['label' => 'Long idle',       'key' => 'idle',     'type' => 'int'],
                    ['label' => 'After-hours',     'key' => 'after',    'type' => 'int'],
                    ['label' => 'Score',           'key' => 'score',    'type' => 'int'],
                ],
                'rows' => collect($d['rows'])->map(fn ($r) => [
                    'plate' => $r['plate'], 'driver' => $r['driver'] ?? '—', 'km' => $r['km'], 'days' => $r['days'],
                    'max' => $r['max_speed'], 'avg' => $r['avg_speed'], 'speeding' => $r['speeding'], 'harsh' => $r['harsh'],
                    'idle' => $r['idle'], 'after' => $r['after_hours'], 'score' => $r['score'],
                ])->all(),
            ]],
        ];

        return $request->get('format') === 'excel' ? ReportExport::xlsx($report) : ReportExport::pdf($report);
    }

    private function compute(Request $request): array
    {
        $tz   = config('tracking.timezone');
        $from = $request->filled('from') ? Carbon::parse($request->input('from'), $tz) : Carbon::now($tz)->startOfMonth();
        $to   = $request->filled('to') ? Carbon::parse($request->input('to'), $tz) : Carbon::now($tz);
        $fromUtc = $from->copy()->startOfDay()->utc();
        $toUtc   = $to->copy()->endOfDay()->utc();

        $stats = VehicleLocation::selectRaw(
            'vehicle_id, SUM(distance_m) AS dist, MAX(speed_kmh) AS max_speed,
             AVG(CASE WHEN speed_kmh >= ? THEN speed_kmh END) AS avg_moving,
             COUNT(DISTINCT DATE(recorded_at)) AS days',
            [config('tracking.moving_speed_kmh')]
        )
            ->whereNotNull('vehicle_id')
            ->whereBetween('recorded_at', [$fromUtc, $toUtc])
            ->groupBy('vehicle_id')
            ->get()->keyBy('vehicle_id');

        $events = GpsEvent::selectRaw('vehicle_id, type, COUNT(*) AS n')
            ->whereBetween('occurred_at', [$fromUtc, $toUtc])
            ->groupBy('vehicle_id', 'type')
            ->get()->groupBy('vehicle_id');

        $w = config('tracking.score_weights');

        $rows = Vehicle::with('driver:id,name')
            ->whereIn('id', $stats->keys()->merge($events->keys())->unique())
            ->orderBy('plate')
            ->get()
            ->map(function (Vehicle $v) use ($stats, $events, $w) {
                $s  = $stats->get($v->id);
                $ev = ($events->get($v->id) ?? collect())->pluck('n', 'type');

                $km       = round(($s->dist ?? 0) / 1000, 1);
                $speeding = (int) ($ev['speeding'] ?? 0);
                $harsh    = (int) (($ev['harsh_acceleration'] ?? 0) + ($ev['harsh_braking'] ?? 0) + ($ev['harsh_cornering'] ?? 0));
                $idle     = (int) ($ev['idle'] ?? 0);

                $penalty = $w['speeding'] * $speeding + $w['harsh'] * $harsh + $w['idle'] * $idle;
                $score   = $s ? max(0, (int) round(100 - 5 * ($penalty * 100 / max($km, 50)))) : null;

                return [
                    'id' => $v->id, 'plate' => $v->plate, 'driver' => $v->driver?->name,
                    'km' => $km, 'days' => (int) ($s->days ?? 0),
                    'max_speed' => (int) round($s->max_speed ?? 0), 'avg_speed' => (int) round($s->avg_moving ?? 0),
                    'speeding' => $speeding, 'harsh' => $harsh, 'idle' => $idle,
                    'after_hours' => (int) ($ev['ignition_after_hours'] ?? 0),
                    'score' => $score,
                    'odometer_km' => $v->mileage_km,     // typed-in odometer, for comparison
                ];
            })->values()->all();

        return [
            'from'       => $from->toDateString(),
            'to'         => $to->toDateString(),
            'rows'       => $rows,
            'totals'     => [
                'km'       => round(collect($rows)->sum('km'), 1),
                'speeding' => collect($rows)->sum('speeding'),
                'harsh'    => collect($rows)->sum('harsh'),
                'idle'     => collect($rows)->sum('idle'),
            ],
            'speedLimit' => config('tracking.speed_limit_kmh'),
        ];
    }
}

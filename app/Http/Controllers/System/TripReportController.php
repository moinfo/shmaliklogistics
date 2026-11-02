<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\GpsEvent;
use App\Models\Trip;
use App\Models\TripCheckIn;
use App\Support\ReportExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/** What the tracker recorded on one trip: distance, speeds, stops, alerts and the driver's check-ins. No money. */
class TripReportController extends Controller
{
    public function index(Request $request)
    {
        $trip = $request->filled('trip') ? Trip::find($request->input('trip')) : null;

        return Inertia::render('system/Fleet/TripReport', [
            'trips'    => Trip::whereNotNull('vehicle_id')->orderByDesc('departure_date')->orderByDesc('id')->limit(300)
                ->get(['id', 'trip_number', 'route_from', 'route_to', 'vehicle_plate'])
                ->map(fn (Trip $t) => [
                    'value' => (string) $t->id,
                    'label' => "{$t->trip_number} · {$t->route_from} → {$t->route_to}" . ($t->vehicle_plate ? " · {$t->vehicle_plate}" : ''),
                ])->values(),
            'selected' => $trip ? (string) $trip->id : null,
            'report'   => $trip ? $this->compute($trip) : null,
            'statuses' => Trip::$statuses,
            'speedLimit' => config('tracking.speed_limit_kmh'),
        ]);
    }

    public function export(Request $request)
    {
        $request->validate(['trip' => 'required|exists:trips,id']);
        $d = $this->compute(Trip::findOrFail($request->input('trip')));
        $t = $d['trip'];
        $g = $d['gps'];

        $summary = [
            'Trip'      => $t['trip_number'] . ' (' . $d['status_label'] . ')',
            'Route'     => "{$t['route_from']} → {$t['route_to']}",
            'Departure' => $t['departure_date'] ?: '—',
            'Arrival'   => $t['arrival_date'] ?: '—',
            'Vehicle'   => $t['vehicle_plate'] ?: '—',
            'Driver'    => $t['driver_name'] ?: '—',
        ];
        $sections = [];

        if ($g) {
            $summary += [
                'GPS distance (km)'     => $g['distance_km'],
                'Max speed (km/h)'      => $g['max_speed'],
                'Avg moving speed (km/h)' => $g['avg_speed'],
                'Time moving (min)'     => $g['moving_minutes'],
                'Time stopped (min)'    => $g['stopped_minutes'],
                'Stops'                 => count($g['stops']),
                'Alerts'                => count($g['events']),
            ];
            $sections[] = [
                'heading' => 'Stops',
                'columns' => [
                    ['label' => 'From', 'key' => 'from', 'type' => 'text'], ['label' => 'To', 'key' => 'to', 'type' => 'text'],
                    ['label' => 'Minutes', 'key' => 'min', 'type' => 'int'], ['label' => 'Latitude', 'key' => 'lat', 'type' => 'text'],
                    ['label' => 'Longitude', 'key' => 'lng', 'type' => 'text'],
                ],
                'rows' => collect($g['stops'])->map(fn ($s) => ['from' => $s['from'], 'to' => $s['to'], 'min' => $s['minutes'], 'lat' => $s['lat'], 'lng' => $s['lng']])->all(),
            ];
            $sections[] = [
                'heading' => 'Alerts',
                'columns' => [
                    ['label' => 'When', 'key' => 'at', 'type' => 'text'], ['label' => 'Type', 'key' => 'type', 'type' => 'text'],
                    ['label' => 'Severity', 'key' => 'sev', 'type' => 'text'], ['label' => 'Detail', 'key' => 'msg', 'type' => 'text'],
                ],
                'rows' => collect($g['events'])->map(fn ($e) => ['at' => $e['at'], 'type' => $e['label'], 'sev' => $e['severity'], 'msg' => $e['message']])->all(),
            ];
        }
        $sections[] = [
            'heading' => 'Driver check-ins',
            'columns' => [
                ['label' => 'When', 'key' => 'at', 'type' => 'text'], ['label' => 'Status', 'key' => 'status', 'type' => 'text'],
                ['label' => 'Location', 'key' => 'loc', 'type' => 'text'], ['label' => 'Odometer', 'key' => 'odo', 'type' => 'int'],
                ['label' => 'Notes', 'key' => 'notes', 'type' => 'text'],
            ],
            'rows' => collect($d['check_ins'])->map(fn ($c) => ['at' => $c['at'], 'status' => $c['status'], 'loc' => $c['location'], 'odo' => $c['odometer'], 'notes' => $c['notes']])->all(),
        ];

        $report = [
            'title'    => 'Trip Tracking Report — ' . $t['trip_number'],
            'subtitle' => "{$t['route_from']} → {$t['route_to']}",
            'filename' => 'trip-tracking-' . $t['trip_number'],
            'summary'  => $summary,
            'sections' => array_values(array_filter($sections, fn ($s) => count($s['rows']) > 0)),
        ];

        return $request->get('format') === 'excel' ? ReportExport::xlsx($report) : ReportExport::pdf($report);
    }

    private function compute(Trip $trip): array
    {
        $trip->load(['driver:id,name,phone', 'vehicle:id,plate,make,model_name']);
        $tz = config('tracking.timezone');

        $checkIns = TripCheckIn::where('trip_id', $trip->id)->orderBy('checked_in_at')->get()
            ->map(fn ($c) => [
                'at'       => $c->checked_in_at?->setTimezone($tz)->format('Y-m-d H:i'),
                'status'   => TripCheckIn::$statuses[$c->status]['label'] ?? $c->status,
                'color'    => TripCheckIn::$statuses[$c->status]['color'] ?? '#64748B',
                'location' => $c->location ?: ($c->lat ? round($c->lat, 5) . ', ' . round($c->lng, 5) : null),
                'odometer' => $c->odometer_km,
                'notes'    => $c->notes,
            ])->values();

        return [
            'trip' => [
                'id' => $trip->id, 'trip_number' => $trip->trip_number, 'status' => $trip->status,
                'route_from' => $trip->route_from, 'route_to' => $trip->route_to,
                'departure_date' => $trip->departure_date?->format('Y-m-d'), 'arrival_date' => $trip->arrival_date?->format('Y-m-d'),
                'days' => $trip->departure_date && $trip->arrival_date ? $trip->departure_date->diffInDays($trip->arrival_date) + 1 : null,
                'driver_name' => $trip->driver?->name ?? $trip->driver_name, 'driver_phone' => $trip->driver?->phone,
                'vehicle_id' => $trip->vehicle_id, 'vehicle_plate' => $trip->vehicle?->plate ?? $trip->vehicle_plate,
                'vehicle_name' => $trip->vehicle ? trim("{$trip->vehicle->make} {$trip->vehicle->model_name}") : null,
            ],
            'status_label' => Trip::$statuses[$trip->status]['label'] ?? $trip->status,
            'check_ins'    => $checkIns,
            'gps'          => $this->gps($trip, $tz),
        ];
    }

    /** GPS facts for the trip window; null when the vehicle has no tracker data in it. */
    private function gps(Trip $trip, string $tz): ?array
    {
        if (! $trip->vehicle_id || ! $trip->departure_date) {
            return null;
        }

        $from = Carbon::parse($trip->departure_date->format('Y-m-d'), $tz)->startOfDay();
        $to   = $trip->arrival_date && in_array($trip->status, ['delivered', 'completed'], true)
            ? Carbon::parse($trip->arrival_date->format('Y-m-d'), $tz)->endOfDay()
            : Carbon::now($tz);
        if ($to->lt($from)) {
            return null;
        }
        $fromUtc = $from->copy()->utc();
        $toUtc   = $to->copy()->utc();

        $rows = DB::table('vehicle_locations')
            ->where('vehicle_id', $trip->vehicle_id)
            ->whereBetween('recorded_at', [$fromUtc->format('Y-m-d H:i:s'), $toUtc->format('Y-m-d H:i:s')])
            ->orderBy('recorded_at')
            ->select(['latitude', 'longitude', 'speed_kmh', 'distance_m', 'recorded_at'])
            ->cursor();

        $moving   = config('tracking.moving_speed_kmh');
        $stopSecs = config('tracking.stop_minutes') * 60;
        $gapSecs  = config('tracking.offline_after_minutes') * 60;

        $n = 0; $distance = 0; $maxSpeed = 0.0; $movingSecs = 0; $speedSum = 0.0; $speedN = 0;
        $first = $last = null; $prevT = null; $run = null; $stops = [];
        $fmt = fn (int $ts) => Carbon::createFromTimestampUTC($ts)->setTimezone($tz)->format('Y-m-d H:i');
        $closeRun = function () use (&$run, &$stops, $stopSecs, $fmt) {
            if ($run && $run['to'] - $run['from'] >= $stopSecs) {
                $stops[] = [
                    'lat' => round($run['lat'], 5), 'lng' => round($run['lng'], 5),
                    'from' => $fmt($run['from']), 'to' => $fmt($run['to']), 'minutes' => (int) round(($run['to'] - $run['from']) / 60),
                ];
            }
            $run = null;
        };

        foreach ($rows as $r) {
            $n++;
            $t = strtotime($r->recorded_at . ' UTC');
            $speed = (float) $r->speed_kmh;
            $distance += (int) $r->distance_m;
            $maxSpeed = max($maxSpeed, $speed);
            $first ??= $t;
            $last = $t;

            if ($speed >= $moving) {
                if ($prevT !== null) {
                    $movingSecs += min($t - $prevT, $gapSecs);
                }
                $speedSum += $speed;
                $speedN++;
                $closeRun();
            } else {
                if ($run && $t - $run['to'] > $gapSecs) {
                    $closeRun();
                }
                $run ??= ['from' => $t, 'to' => $t, 'lat' => (float) $r->latitude, 'lng' => (float) $r->longitude];
                $run['to'] = $t;
            }
            $prevT = $t;
        }
        $closeRun();

        if ($n === 0) {
            return null;
        }

        $events = GpsEvent::where('vehicle_id', $trip->vehicle_id)
            ->whereBetween('occurred_at', [$fromUtc, $toUtc])
            ->orderBy('occurred_at')->limit(300)->get()
            ->map(fn (GpsEvent $e) => [
                'at' => $e->occurred_at->setTimezone($tz)->format('Y-m-d H:i'), 'type' => $e->type,
                'label' => GpsEvent::TYPES[$e->type][0] ?? $e->type, 'icon' => GpsEvent::TYPES[$e->type][1] ?? '📍',
                'severity' => $e->severity, 'message' => $e->message,
            ])->values();

        return [
            'records'         => $n,
            'distance_km'     => round($distance / 1000, 1),
            'max_speed'       => (int) round($maxSpeed),
            'avg_speed'       => $speedN ? (int) round($speedSum / $speedN) : 0,
            'moving_minutes'  => (int) round($movingSecs / 60),
            'stopped_minutes' => (int) collect($stops)->sum('minutes'),
            'first'           => $fmt($first),
            'last'            => $fmt($last),
            'stops'           => $stops,
            'events'          => $events,
            'counts'          => $events->groupBy('type')->map->count(),
            'from'            => $fromUtc->toIso8601String(),
            'to'              => $toUtc->toIso8601String(),
        ];
    }
}

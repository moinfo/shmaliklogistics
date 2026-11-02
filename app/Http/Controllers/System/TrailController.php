<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\GpsEvent;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/** Trip replay: the route a vehicle drove between two moments, with stops and summary. */
class TrailController extends Controller
{
    /** Longest window we replay in one go. */
    private const MAX_DAYS = 7;

    /** Points returned to the browser; longer routes are thinned evenly. */
    private const MAX_POINTS = 2500;

    public function index(Vehicle $vehicle)
    {
        return Inertia::render('system/Fleet/Trail', [
            'vehicle'    => $vehicle->only('id', 'plate', 'make', 'type'),
            'maxDays'    => self::MAX_DAYS,
            'speedLimit' => config('tracking.speed_limit_kmh'),
        ]);
    }

    public function data(Request $request, Vehicle $vehicle): JsonResponse
    {
        $request->validate(['from' => 'required|date', 'to' => 'nullable|date']);

        $from = Carbon::parse($request->input('from'))->utc();
        $to   = $request->filled('to') ? Carbon::parse($request->input('to'))->utc() : now();

        if ($to->lt($from)) {
            return response()->json(['message' => 'The end must be after the start.'], 422);
        }
        if ($from->diffInDays($to) > self::MAX_DAYS) {
            return response()->json(['message' => 'Pick a window of at most ' . self::MAX_DAYS . ' days.'], 422);
        }

        $rows = DB::table('vehicle_locations')
            ->where('vehicle_id', $vehicle->id)
            ->whereBetween('recorded_at', [$from->format('Y-m-d H:i:s'), $to->format('Y-m-d H:i:s')])
            ->orderBy('recorded_at')
            ->get(['latitude', 'longitude', 'speed_kmh', 'ignition', 'recorded_at', 'distance_m'])
            ->values();

        $moving   = config('tracking.moving_speed_kmh');
        $stopSecs = config('tracking.stop_minutes') * 60;
        $gapSecs  = config('tracking.offline_after_minutes') * 60;   // a longer silence breaks a stop

        $distance   = 0;
        $maxSpeed   = 0.0;
        $movingSecs = 0;
        $speedSum   = 0.0;
        $speedN     = 0;
        $stops      = [];
        $run        = null;      // current stationary stretch: [startIdx, startTs, lastTs]
        $ts         = [];

        $closeRun = function () use (&$run, &$stops, $stopSecs, $rows) {
            if ($run && $run[2] - $run[1] >= $stopSecs) {
                $r = $rows[$run[0]];
                $stops[] = [
                    'lat' => (float) $r->latitude, 'lng' => (float) $r->longitude,
                    'from' => $run[1], 'to' => $run[2], 'minutes' => (int) round(($run[2] - $run[1]) / 60),
                ];
            }
            $run = null;
        };

        foreach ($rows as $i => $r) {
            $t        = strtotime($r->recorded_at . ' UTC');
            $ts[$i]   = $t;
            $speed    = (float) $r->speed_kmh;
            $distance += (int) $r->distance_m;
            $maxSpeed = max($maxSpeed, $speed);

            if ($speed >= $moving) {
                if ($i > 0) {
                    $movingSecs += min($t - $ts[$i - 1], $gapSecs);
                }
                $speedSum += $speed;
                $speedN++;
                $closeRun();
            } else {
                if ($run && $t - $run[2] > $gapSecs) {
                    $closeRun();
                }
                $run ??= [$i, $t, $t];
                $run[2] = $t;
            }
        }
        $closeRun();

        // Thin out long routes, always keeping the first and last point.
        $n      = count($rows);
        $step   = max(1, (int) ceil($n / self::MAX_POINTS));
        $points = [];
        foreach ($rows as $i => $r) {
            if ($i % $step === 0 || $i === $n - 1) {
                $points[] = [
                    round((float) $r->latitude, 6), round((float) $r->longitude, 6),
                    $ts[$i], (int) round((float) $r->speed_kmh),
                    $r->ignition === null ? null : (int) $r->ignition,
                ];
            }
        }

        $events = GpsEvent::where('vehicle_id', $vehicle->id)
            ->whereBetween('occurred_at', [$from, $to])
            ->whereNotNull('latitude')
            ->orderBy('occurred_at')
            ->limit(300)
            ->get()
            ->map(fn (GpsEvent $e) => [
                'type' => $e->type, 'label' => GpsEvent::TYPES[$e->type][0] ?? $e->type, 'icon' => GpsEvent::TYPES[$e->type][1] ?? '📍',
                'severity' => $e->severity, 'message' => $e->message,
                'lat' => $e->latitude, 'lng' => $e->longitude, 'at' => $e->occurred_at->timestamp,
            ])->values();

        return response()->json([
            'vehicle' => ['id' => $vehicle->id, 'plate' => $vehicle->plate],
            'points'  => $points,
            'stops'   => $stops,
            'events'  => $events,
            'summary' => [
                'records'        => $n,
                'distance_km'    => round($distance / 1000, 1),
                'max_speed'      => (int) round($maxSpeed),
                'avg_speed'      => $speedN ? (int) round($speedSum / $speedN) : 0,
                'moving_minutes' => (int) round($movingSecs / 60),
                'stops'          => count($stops),
                'from'           => $n ? $ts[0] : null,
                'to'             => $n ? $ts[$n - 1] : null,
            ],
        ]);
    }
}

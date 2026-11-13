<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Geofence;
use App\Models\Vehicle;
use App\Services\FleetPositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetTrackingController extends Controller
{
    public function __construct(private FleetPositionService $positions) {}

    public function index()
    {
        return Inertia::render('system/Fleet/LiveMap', [
            'vehicles'       => $this->positions->all(),
            'geofences'      => Geofence::where('is_active', true)->get(['id', 'name', 'center_lat', 'center_lng', 'radius_m', 'color']),
            'refreshSeconds' => 4,
        ]);
    }

    /** JSON feed polled by the Live Map page. */
    public function positions(): JsonResponse
    {
        return response()->json(['vehicles' => $this->positions->all(), 'server_time' => now()->toIso8601String()]);
    }

    /** Current positions of one vehicle plus its place name — small widget feed (vehicle page, trip page). */
    public function current(Vehicle $vehicle): JsonResponse
    {
        $position = $this->positions->all([$vehicle->id])[0] ?? null;

        if (! $position) {
            // response()->json(null) is NOT the JSON `null`: Symfony's JsonResponse silently
            // replaces a null payload with an empty ArrayObject (XSSI hardening), so the
            // frontend would receive `{}` and crash reading current.lat off it. Send the
            // literal JSON `null` the frontend's "no tracker yet" check expects.
            return response()->json(null, 200)->setContent('null');
        }

        return response()->json($position);
    }
}

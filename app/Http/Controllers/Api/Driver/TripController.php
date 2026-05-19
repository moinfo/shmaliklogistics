<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;

        $trips = Trip::where('driver_id', $driver->id)
            ->with('vehicle:id,plate,make,model_name')
            ->latest('departure_date')
            ->paginate(20);

        return response()->json([
            'trips'         => $trips,
            'trip_statuses' => Trip::$statuses,
        ]);
    }

    public function show(Request $request, Trip $trip): JsonResponse
    {
        $driver = $request->user()->driver;
        abort_unless($trip->driver_id === $driver->id, 403);

        $trip->load(['vehicle:id,plate,make,model_name,type', 'expenses', 'checkIns' => function ($q) {
            $q->latest('checked_in_at')->limit(20);
        }]);

        $trip->append(['total_costs']);

        return response()->json([
            'trip'          => $trip,
            'trip_statuses' => Trip::$statuses,
        ]);
    }
}
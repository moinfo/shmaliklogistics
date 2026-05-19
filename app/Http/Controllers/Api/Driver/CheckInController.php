<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripCheckIn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;

        $checkIns = TripCheckIn::where('driver_id', $driver->id)
            ->with('trip:id,trip_number,route_from,route_to,status')
            ->latest('checked_in_at')
            ->paginate(30);

        return response()->json([
            'check_ins' => $checkIns,
            'statuses'  => TripCheckIn::$statuses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;

        $data = $request->validate([
            'trip_id'     => 'required|exists:trips,id',
            'status'      => 'required|in:ok,issue,emergency',
            'lat'         => 'nullable|numeric|between:-90,90',
            'lng'         => 'nullable|numeric|between:-180,180',
            'location'    => 'nullable|string|max:120',
            'odometer_km' => 'nullable|integer|min:0|max:9999999',
            'notes'       => 'nullable|string|max:2000',
        ]);

        $trip = Trip::find($data['trip_id']);

        if (! $trip || $trip->driver_id !== $driver->id) {
            return response()->json(['message' => 'That trip is not assigned to you.'], 403);
        }

        $checkIn = TripCheckIn::create([
            'trip_id'       => $trip->id,
            'driver_id'     => $driver->id,
            'vehicle_id'    => $trip->vehicle_id ?? $driver->vehicle?->id,
            'checked_in_at' => now(),
            'lat'           => $data['lat'] ?? null,
            'lng'           => $data['lng'] ?? null,
            'location'      => $data['location'] ?? null,
            'odometer_km'   => $data['odometer_km'] ?? null,
            'status'        => $data['status'],
            'notes'         => $data['notes'] ?? null,
            'created_by'    => $request->user()->id,
        ]);

        return response()->json([
            'message'   => 'Check-in saved successfully.',
            'check_in'  => $checkIn->load('trip:id,trip_number,route_from,route_to'),
        ], 201);
    }
}
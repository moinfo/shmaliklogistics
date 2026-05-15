<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripCheckIn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverCheckInController extends Controller
{
    public function index(Request $request)
    {
        $driver = $request->user()->driver;

        $checkIns = TripCheckIn::where('driver_id', $driver->id)
            ->with('trip:id,trip_number,route_from,route_to,status')
            ->latest('checked_in_at')
            ->paginate(30);

        return Inertia::render('driver/CheckIns/Index', [
            'checkIns' => $checkIns,
            'statuses' => TripCheckIn::$statuses,
        ]);
    }

    public function create(Request $request)
    {
        $driver = $request->user()->driver->load('vehicle:id,plate,make,model_name');

        $activeTrips = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->with('vehicle:id,plate,make,model_name')
            ->get();

        $tripId = $request->query('trip');
        $selectedTrip = $tripId
            ? $activeTrips->firstWhere('id', (int) $tripId)
            : $activeTrips->first();

        // Last check-in for the selected trip (so the UI can show "Mwisho: 1h iliyopita")
        $lastCheckIn = $selectedTrip
            ? TripCheckIn::where('trip_id', $selectedTrip->id)
                ->latest('checked_in_at')
                ->first()
            : null;

        return Inertia::render('driver/CheckIns/Create', [
            'driver'         => $driver,
            'activeTrips'    => $activeTrips,
            'selectedTripId' => $selectedTrip?->id,
            'lastCheckIn'    => $lastCheckIn,
            'intervalHours'  => TripCheckIn::INTERVAL_HOURS,
            'statuses'       => TripCheckIn::$statuses,
        ]);
    }

    public function store(Request $request)
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
        abort_unless($trip && $trip->driver_id === $driver->id, 403, 'That trip is not assigned to you.');

        TripCheckIn::create([
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

        return redirect()->route('driver.dashboard')
            ->with('success', 'Check-in imehifadhiwa. Salama safarini!');
    }
}

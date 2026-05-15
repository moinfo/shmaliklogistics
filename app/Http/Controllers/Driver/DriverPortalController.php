<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\VehicleInspection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $driver = $request->user()->driver->load(['vehicle:id,plate,make,model_name,type']);

        $active = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->with('vehicle:id,plate,make,model_name')
            ->orderBy('departure_date')
            ->get();

        $upcoming = Trip::where('driver_id', $driver->id)
            ->where('status', 'planned')
            ->with('vehicle:id,plate,make,model_name')
            ->orderBy('departure_date')
            ->limit(5)
            ->get();

        $recent = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->with('vehicle:id,plate,make,model_name')
            ->latest('departure_date')
            ->limit(5)
            ->get();

        $todayInspection = $driver->vehicle
            ? VehicleInspection::where('vehicle_id', $driver->vehicle->id)
                ->where('driver_id', $driver->id)
                ->whereDate('inspected_at', today())
                ->where('inspection_type', 'pre_trip')
                ->latest('inspected_at')
                ->first()
            : null;

        $stats = [
            'active_trips'    => $active->count(),
            'upcoming_trips'  => Trip::where('driver_id', $driver->id)->where('status', 'planned')->count(),
            'completed_month' => Trip::where('driver_id', $driver->id)
                ->whereIn('status', ['delivered', 'completed'])
                ->whereMonth('departure_date', now()->month)
                ->whereYear('departure_date', now()->year)
                ->count(),
        ];

        return Inertia::render('driver/Dashboard', [
            'driver'          => $driver,
            'active'          => $active,
            'upcoming'        => $upcoming,
            'recent'          => $recent,
            'todayInspection' => $todayInspection,
            'stats'           => $stats,
            'tripStatuses'    => Trip::$statuses,
        ]);
    }

    public function trips(Request $request)
    {
        $driver = $request->user()->driver;

        $trips = Trip::where('driver_id', $driver->id)
            ->with('vehicle:id,plate,make,model_name')
            ->latest('departure_date')
            ->paginate(20);

        return Inertia::render('driver/Trips/Index', [
            'trips'        => $trips,
            'tripStatuses' => Trip::$statuses,
        ]);
    }

    public function tripShow(Request $request, Trip $trip)
    {
        $driver = $request->user()->driver;
        abort_unless($trip->driver_id === $driver->id, 403);

        $trip->load(['vehicle:id,plate,make,model_name,type', 'expenses']);
        $trip->append(['total_costs']);

        return Inertia::render('driver/Trips/Show', [
            'trip'         => $trip,
            'tripStatuses' => Trip::$statuses,
        ]);
    }
}

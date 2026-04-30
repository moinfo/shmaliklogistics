<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('plate', 'like', "%{$s}%")
                  ->orWhere('make', 'like', "%{$s}%")
                  ->orWhere('model_name', 'like', "%{$s}%")
                  ->orWhere('type', 'like', "%{$s}%");
            });
        }

        $vehicles = $query->with('driver')->paginate(15)->withQueryString();

        $stats = [
            'total'       => Vehicle::count(),
            'active'      => Vehicle::whereIn('status', ['active', 'on_road', 'loading', 'at_border'])->count(),
            'maintenance' => Vehicle::where('status', 'maintenance')->count(),
            'expiring'    => Vehicle::where(function ($q) {
                $soon = now()->addDays(30);
                $q->where('insurance_expiry', '<=', $soon)
                  ->orWhere('road_licence_expiry', '<=', $soon)
                  ->orWhere('fitness_expiry', '<=', $soon);
            })->count(),
        ];

        return Inertia::render('system/Fleet/Index', [
            'vehicles' => $vehicles,
            'stats'    => $stats,
            'statuses' => Vehicle::$statuses,
            'types'    => Vehicle::$types,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Fleet/Create', [
            'statuses' => Vehicle::$statuses,
            'types'    => Vehicle::$types,
            'drivers'  => Driver::whereIn('status', ['active', 'idle'])->orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plate'               => 'required|string|max:20|unique:vehicles,plate',
            'status'              => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
            'driver_id'           => 'nullable|exists:drivers,id',
            'make'                => 'required|string|max:60',
            'model_name'          => 'required|string|max:60',
            'year'                => 'required|integer|min:1990|max:' . (now()->year + 1),
            'type'                => 'required|string|max:40',
            'color'               => 'nullable|string|max:40',
            'payload_tons'        => 'nullable|numeric|min:0',
            'mileage_km'          => 'required|integer|min:0',
            'insurance_expiry'    => 'nullable|date',
            'road_licence_expiry' => 'nullable|date',
            'fitness_expiry'      => 'nullable|date',
            'next_service_date'   => 'nullable|date',
            'owner_name'          => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
        ]);

        $data['plate']      = strtoupper($data['plate']);
        $data['created_by'] = $request->user()->id;

        $vehicle = Vehicle::create($data);

        return redirect()->route('system.fleet.show', $vehicle)
            ->with('success', "Vehicle {$vehicle->plate} registered successfully.");
    }

    public function show(Vehicle $vehicle)
    {
        $vehicle->load('driver');

        $trips = \App\Models\Trip::where('vehicle_plate', $vehicle->plate)
            ->latest('departure_date')
            ->limit(10)
            ->get();

        return Inertia::render('system/Fleet/Show', [
            'vehicle'  => $vehicle,
            'trips'    => $trips,
            'statuses' => Vehicle::$statuses,
        ]);
    }

    public function edit(Vehicle $vehicle)
    {
        return Inertia::render('system/Fleet/Edit', [
            'vehicle'  => $vehicle,
            'statuses' => Vehicle::$statuses,
            'types'    => Vehicle::$types,
            'drivers'  => Driver::orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'plate'               => 'required|string|max:20|unique:vehicles,plate,' . $vehicle->id,
            'status'              => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
            'driver_id'           => 'nullable|exists:drivers,id',
            'make'                => 'required|string|max:60',
            'model_name'          => 'required|string|max:60',
            'year'                => 'required|integer|min:1990|max:' . (now()->year + 1),
            'type'                => 'required|string|max:40',
            'color'               => 'nullable|string|max:40',
            'payload_tons'        => 'nullable|numeric|min:0',
            'mileage_km'          => 'required|integer|min:0',
            'insurance_expiry'    => 'nullable|date',
            'road_licence_expiry' => 'nullable|date',
            'fitness_expiry'      => 'nullable|date',
            'next_service_date'   => 'nullable|date',
            'owner_name'          => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
        ]);

        $data['plate'] = strtoupper($data['plate']);
        $vehicle->update($data);

        return redirect()->route('system.fleet.show', $vehicle)
            ->with('success', "Vehicle {$vehicle->plate} updated.");
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()->route('system.fleet.index')
            ->with('success', "Vehicle {$vehicle->plate} removed from fleet.");
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
        ]);

        $vehicle->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }
}

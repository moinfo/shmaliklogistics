<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\LicenseClass;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\VehicleDocumentType;
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
                  ->orWhere('chassis_number', 'like', "%{$s}%")
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
                  ->orWhere('fitness_expiry', '<=', $soon)
                  ->orWhere('tra_sticker_expiry', '<=', $soon)
                  ->orWhere('goods_vehicle_licence_expiry', '<=', $soon);
            })->count(),
        ];

        $gpsVehicles = Vehicle::whereNotNull('gps_lat')
            ->whereNotNull('gps_lng')
            ->with('driver:id,name')
            ->get(['id', 'plate', 'make', 'model_name', 'type', 'status', 'driver_id', 'gps_lat', 'gps_lng', 'gps_last_seen', 'gps_location_name']);

        return Inertia::render('system/Fleet/Index', [
            'vehicles'    => $vehicles,
            'gpsVehicles' => $gpsVehicles,
            'stats'       => $stats,
            'statuses'    => Vehicle::$statuses,
            'typeIcons'   => Vehicle::$typeIcons,
            'filters'     => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Fleet/Create', [
            'statuses'            => Vehicle::$statuses,
            'types'               => Vehicle::$types,
            'fuelTypes'           => Vehicle::$fuelTypes,
            'typeIcons'           => Vehicle::$typeIcons,
            'drivers'             => Driver::whereIn('status', ['active', 'idle'])->orderBy('name')->get(['id', 'name', 'phone']),
            'customDocumentTypes' => VehicleDocumentType::active()->custom()->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plate'                        => 'required|string|max:20|unique:vehicles,plate',
            'chassis_number'               => 'nullable|string|max:50|unique:vehicles,chassis_number',
            'engine_number'                => 'nullable|string|max:50',
            'status'                       => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
            'driver_id'                    => 'nullable|exists:drivers,id',
            'make'                         => 'required|string|max:60',
            'model_name'                   => 'required|string|max:60',
            'year'                         => 'required|integer|min:1990|max:' . (now()->year + 1),
            'type'                         => 'required|string|max:40',
            'color'                        => 'nullable|string|max:40',
            'payload_tons'                 => 'nullable|numeric|min:0',
            'mileage_km'                   => 'required|integer|min:0',
            'fuel_type'                    => 'required|in:diesel,petrol,cng',
            'fuel_tank_capacity_l'         => 'nullable|integer|min:0',
            'insurance_expiry'             => 'nullable|date',
            'road_licence_expiry'          => 'nullable|date',
            'fitness_expiry'               => 'nullable|date',
            'tra_sticker_expiry'           => 'nullable|date',
            'goods_vehicle_licence_expiry' => 'nullable|date',
            'next_service_date'            => 'nullable|date',
            'owner_name'                   => 'nullable|string|max:100',
            'notes'                        => 'nullable|string',
            'extra_documents'              => 'nullable|array',
            'extra_documents.*'            => 'nullable|date',
        ]);

        $data['plate']          = strtoupper($data['plate']);
        $data['chassis_number'] = $data['chassis_number'] ? strtoupper($data['chassis_number']) : null;
        $data['created_by']     = $request->user()->id;

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

        // Available drivers for quick-assign (active or already on this vehicle)
        $availableDrivers = Driver::where(function ($q) use ($vehicle) {
            $q->whereIn('status', ['active', 'idle'])
              ->orWhere('id', $vehicle->driver_id);
        })->orderBy('name')->get(['id', 'name', 'phone', 'status', 'license_classes']);

        return Inertia::render('system/Fleet/Show', [
            'vehicle'             => $vehicle,
            'trips'               => $trips,
            'statuses'            => Vehicle::$statuses,
            'driverStatuses'      => Driver::$statuses,
            'licenseClasses'      => LicenseClass::active()->orderBy('sort_order')->get()
                ->mapWithKeys(fn($c) => [$c->code => "{$c->name} ({$c->description})"])->toArray(),
            'typeIcons'           => Vehicle::$typeIcons,
            'availableDrivers'    => $availableDrivers,
            'customDocumentTypes' => VehicleDocumentType::active()->custom()->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function edit(Vehicle $vehicle)
    {
        return Inertia::render('system/Fleet/Edit', [
            'vehicle'             => $vehicle,
            'statuses'            => Vehicle::$statuses,
            'types'               => Vehicle::$types,
            'fuelTypes'           => Vehicle::$fuelTypes,
            'typeIcons'           => Vehicle::$typeIcons,
            'drivers'             => Driver::orderBy('name')->get(['id', 'name', 'phone']),
            'customDocumentTypes' => VehicleDocumentType::active()->custom()->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'plate'                        => 'required|string|max:20|unique:vehicles,plate,' . $vehicle->id,
            'chassis_number'               => 'nullable|string|max:50|unique:vehicles,chassis_number,' . $vehicle->id,
            'engine_number'                => 'nullable|string|max:50',
            'status'                       => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
            'driver_id'                    => 'nullable|exists:drivers,id',
            'make'                         => 'required|string|max:60',
            'model_name'                   => 'required|string|max:60',
            'year'                         => 'required|integer|min:1990|max:' . (now()->year + 1),
            'type'                         => 'required|string|max:40',
            'color'                        => 'nullable|string|max:40',
            'payload_tons'                 => 'nullable|numeric|min:0',
            'mileage_km'                   => 'required|integer|min:0',
            'fuel_type'                    => 'required|in:diesel,petrol,cng',
            'fuel_tank_capacity_l'         => 'nullable|integer|min:0',
            'insurance_expiry'             => 'nullable|date',
            'road_licence_expiry'          => 'nullable|date',
            'fitness_expiry'               => 'nullable|date',
            'tra_sticker_expiry'           => 'nullable|date',
            'goods_vehicle_licence_expiry' => 'nullable|date',
            'next_service_date'            => 'nullable|date',
            'owner_name'                   => 'nullable|string|max:100',
            'notes'                        => 'nullable|string',
            'extra_documents'              => 'nullable|array',
            'extra_documents.*'            => 'nullable|date',
        ]);

        $data['plate']          = strtoupper($data['plate']);
        $data['chassis_number'] = $data['chassis_number'] ? strtoupper($data['chassis_number']) : null;
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

    public function assignDriver(Request $request, Vehicle $vehicle)
    {
        $request->validate(['driver_id' => 'nullable|exists:drivers,id']);

        // Unassign the new driver from any other vehicle first
        if ($request->driver_id) {
            Vehicle::where('driver_id', $request->driver_id)
                ->where('id', '!=', $vehicle->id)
                ->update(['driver_id' => null]);
        }

        $vehicle->update(['driver_id' => $request->driver_id]);

        $driver = $request->driver_id ? Driver::find($request->driver_id) : null;
        $msg = $driver
            ? "{$driver->name} assigned to {$vehicle->plate}."
            : "Driver removed from {$vehicle->plate}.";

        return back()->with('success', $msg);
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Vehicle::$statuses)),
        ]);

        $vehicle->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }

    public function updateGps(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'gps_lat'           => 'required|numeric|between:-90,90',
            'gps_lng'           => 'required|numeric|between:-180,180',
            'gps_location_name' => 'nullable|string|max:200',
        ]);

        $data['gps_last_seen'] = now();
        $vehicle->update($data);

        return back()->with('success', 'GPS position updated.');
    }
}

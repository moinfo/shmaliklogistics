<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('license_number', 'like', "%{$s}%")
                  ->orWhere('national_id', 'like', "%{$s}%");
            });
        }

        $drivers = $query->paginate(15)->withQueryString();

        $stats = [
            'total'           => Driver::count(),
            'active'          => Driver::whereIn('status', ['active', 'on_trip'])->count(),
            'on_trip'         => Driver::where('status', 'on_trip')->count(),
            'license_expiring' => Driver::whereNotNull('license_expiry')
                ->where('license_expiry', '<=', now()->addDays(30))
                ->count(),
        ];

        return Inertia::render('system/Drivers/Index', [
            'drivers'  => $drivers,
            'stats'    => $stats,
            'statuses' => Driver::$statuses,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Drivers/Create', [
            'statuses'       => Driver::$statuses,
            'licenseClasses' => Driver::$licenseClasses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:100',
            'status'                  => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30|unique:drivers,national_id',
            'address'                 => 'nullable|string|max:200',
            'license_number'          => 'nullable|string|max:40|unique:drivers,license_number',
            'license_class'           => 'nullable|string|max:20',
            'license_expiry'          => 'nullable|date',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes'                   => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $driver = Driver::create($data);

        return redirect()->route('system.drivers.show', $driver)
            ->with('success', "Driver {$driver->name} registered successfully.");
    }

    public function show(Driver $driver)
    {
        $trips = Trip::where('driver_name', $driver->name)
            ->latest('departure_date')
            ->limit(10)
            ->get();

        return Inertia::render('system/Drivers/Show', [
            'driver'   => $driver,
            'trips'    => $trips,
            'statuses' => Driver::$statuses,
        ]);
    }

    public function edit(Driver $driver)
    {
        return Inertia::render('system/Drivers/Edit', [
            'driver'         => $driver,
            'statuses'       => Driver::$statuses,
            'licenseClasses' => Driver::$licenseClasses,
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:100',
            'status'                  => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30|unique:drivers,national_id,' . $driver->id,
            'address'                 => 'nullable|string|max:200',
            'license_number'          => 'nullable|string|max:40|unique:drivers,license_number,' . $driver->id,
            'license_class'           => 'nullable|string|max:20',
            'license_expiry'          => 'nullable|date',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes'                   => 'nullable|string',
        ]);

        $driver->update($data);

        return redirect()->route('system.drivers.show', $driver)
            ->with('success', "Driver {$driver->name} updated.");
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return redirect()->route('system.drivers.index')
            ->with('success', "Driver {$driver->name} removed.");
    }

    public function updateStatus(Request $request, Driver $driver)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
        ]);

        $driver->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }
}

<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\VehicleInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriverInspectionController extends Controller
{
    public function create(Request $request)
    {
        $driver = $request->user()->driver->load('vehicle:id,plate,make,model_name,type');
        $tripId = $request->query('trip');

        $trip = $tripId
            ? Trip::where('id', $tripId)->where('driver_id', $driver->id)->first()
            : null;

        $recent = VehicleInspection::where('driver_id', $driver->id)
            ->latest('inspected_at')
            ->limit(5)
            ->get();

        return Inertia::render('driver/Inspections/Create', [
            'driver'    => $driver,
            'trip'      => $trip,
            'checklist' => VehicleInspection::$defaultChecklist,
            'statuses'  => VehicleInspection::$statuses,
            'types'     => VehicleInspection::$types,
            'recent'    => $recent,
        ]);
    }

    public function store(Request $request)
    {
        $driver = $request->user()->driver;
        if (! $driver->vehicle) {
            return back()->withErrors(['vehicle' => 'No vehicle is assigned to you. Please contact dispatch.']);
        }

        $data = $request->validate([
            'inspection_type'    => 'required|in:pre_trip,periodic,post_trip',
            'trip_id'            => 'nullable|exists:trips,id',
            'items'              => 'required|array',
            'items.*.status'     => 'required|in:ok,issue,na',
            'items.*.notes'      => 'nullable|string|max:500',
            'overall_status'     => 'required|in:ok,minor_issues,critical',
            'odometer_km'        => 'nullable|integer|min:0|max:9999999',
            'location'           => 'nullable|string|max:120',
            'lat'                => 'nullable|numeric|between:-90,90',
            'lng'                => 'nullable|numeric|between:-180,180',
            'notes'              => 'nullable|string|max:2000',
            'photo'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:6144',
        ]);

        // Driver may only attach a trip that belongs to them
        if (!empty($data['trip_id'])) {
            $assigned = Trip::where('id', $data['trip_id'])->where('driver_id', $driver->id)->exists();
            if (! $assigned) {
                return back()->withErrors(['trip_id' => 'That trip is not assigned to you.']);
            }
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store("inspections/{$driver->vehicle->id}", 'public');
        }

        VehicleInspection::create([
            'vehicle_id'      => $driver->vehicle->id,
            'driver_id'       => $driver->id,
            'trip_id'         => $data['trip_id'] ?? null,
            'inspection_type' => $data['inspection_type'],
            'inspected_at'    => now(),
            'items'           => $data['items'],
            'overall_status'  => $data['overall_status'],
            'odometer_km'     => $data['odometer_km'] ?? null,
            'location'        => $data['location'] ?? null,
            'lat'             => $data['lat'] ?? null,
            'lng'             => $data['lng'] ?? null,
            'notes'           => $data['notes'] ?? null,
            'photo_path'      => $photoPath,
            'created_by'      => $request->user()->id,
        ]);

        return redirect()->route('driver.dashboard')
            ->with('success', 'Ukaguzi umehifadhiwa kwa mafanikio.');
    }

    public function index(Request $request)
    {
        $driver = $request->user()->driver;

        $inspections = VehicleInspection::where('driver_id', $driver->id)
            ->with('vehicle:id,plate,make,model_name')
            ->latest('inspected_at')
            ->paginate(20);

        return Inertia::render('driver/Inspections/Index', [
            'inspections' => $inspections,
            'statuses'    => VehicleInspection::$statuses,
            'types'       => VehicleInspection::$types,
        ]);
    }
}

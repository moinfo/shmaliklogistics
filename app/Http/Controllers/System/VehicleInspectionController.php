<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleInspectionController extends Controller
{
    public function index(Request $request)
    {
        $query = VehicleInspection::with(['vehicle:id,plate,make,model_name', 'driver:id,name,phone'])
            ->latest('inspected_at');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->filled('status')) {
            $query->where('overall_status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('inspection_type', $request->type);
        }

        $inspections = $query->paginate(20)->withQueryString();

        $stats = [
            'today'    => VehicleInspection::whereDate('inspected_at', today())->count(),
            'critical' => VehicleInspection::where('overall_status', 'critical')->count(),
            'issues'   => VehicleInspection::where('overall_status', 'minor_issues')->count(),
            'total'    => VehicleInspection::count(),
        ];

        return Inertia::render('system/Inspections/Index', [
            'inspections' => $inspections,
            'stats'       => $stats,
            'vehicles'    => Vehicle::orderBy('plate')->get(['id', 'plate']),
            'drivers'     => Driver::orderBy('name')->get(['id', 'name']),
            'statuses'    => VehicleInspection::$statuses,
            'types'       => VehicleInspection::$types,
            'filters'     => $request->only(['vehicle_id', 'driver_id', 'status', 'type']),
        ]);
    }

    public function show(VehicleInspection $inspection)
    {
        $inspection->load(['vehicle:id,plate,make,model_name,type', 'driver:id,name,phone,photo_path', 'trip:id,trip_number,route_from,route_to', 'creator:id,name']);

        return Inertia::render('system/Inspections/Show', [
            'inspection' => $inspection,
            'checklist'  => VehicleInspection::$defaultChecklist,
            'statuses'   => VehicleInspection::$statuses,
            'types'      => VehicleInspection::$types,
        ]);
    }
}

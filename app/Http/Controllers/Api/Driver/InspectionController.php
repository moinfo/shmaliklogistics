<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\VehicleInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InspectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;

        $inspections = VehicleInspection::where('driver_id', $driver->id)
            ->with('vehicle:id,plate,make,model_name')
            ->with('trip:id,trip_number,route_from,route_to')
            ->latest('inspected_at')
            ->paginate(20);

        return response()->json([
            'inspections'     => $inspections,
            'sections'        => VehicleInspection::$checklistSections,
            'statuses'        => VehicleInspection::$statuses,
            'types'           => VehicleInspection::$types,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;

        $vehicleId = $driver->vehicle?->id;

        if (! $vehicleId) {
            return response()->json(['message' => 'No vehicle is assigned to your account.'], 422);
        }

        $data = $request->validate([
            'inspection_type' => ['required', Rule::in(array_keys(VehicleInspection::$types))],
            'trip_id'         => ['nullable', Rule::exists('trips', 'id')->where('driver_id', $driver->id)],
            'odometer_km'     => ['nullable', 'numeric', 'min:0'],
            'location'        => ['nullable', 'string', 'max:255'],
            'lat'             => ['nullable', 'numeric'],
            'lng'             => ['nullable', 'numeric'],
            'notes'           => ['nullable', 'string', 'max:1000'],
            'overall_status'  => ['required', Rule::in(array_keys(VehicleInspection::$statuses))],
            'items'           => ['required', 'array'],
            'items.*.key'     => ['required', 'string', Rule::in(array_keys(VehicleInspection::$defaultChecklist))],
            'items.*.status'  => ['required', Rule::in(['ok', 'issue', 'na'])],
            'items.*.note'    => ['nullable', 'string', 'max:255'],
        ]);

        $inspection = VehicleInspection::create([
            'vehicle_id'      => $vehicleId,
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
            'created_by'      => $request->user()->id,
        ]);

        return response()->json(['inspection' => $inspection], 201);
    }
}

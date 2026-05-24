<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Vehicle ("All Vehicles" / fleet) endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\VehicleController but
/// returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by the route middleware (permission:fleet.view).
class VehicleController extends Controller
{
    // The statutory document expiries surfaced as a fleet-compliance checklist,
    // mirroring System\VehicleController's "expiring" stat (next 30 days).
    private const DOCUMENTS = [
        'insurance'             => ['Insurance',             'insurance_expiry'],
        'road_licence'          => ['Road Licence',          'road_licence_expiry'],
        'fitness'               => ['Fitness',               'fitness_expiry'],
        'tra_sticker'           => ['TRA Sticker',           'tra_sticker_expiry'],
        'goods_vehicle_licence' => ['Goods Vehicle Licence', 'goods_vehicle_licence_expiry'],
    ];

    // GET /api/staff/modules/vehicles — searchable list, newest first.
    public function index(Request $request): JsonResponse
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

        $vehicles = $query->with('driver:id,name,phone')
            ->get()
            ->map(fn (Vehicle $v) => $this->summarize($v));

        return response()->json([
            'vehicles' => $vehicles,
            'statuses' => Vehicle::$statuses,
        ]);
    }

    // GET /api/staff/modules/vehicles/{id} — single vehicle with recent trips.
    public function show($id): JsonResponse
    {
        $vehicle = Vehicle::with('driver:id,name,phone,status')->findOrFail($id);

        $trips = Trip::where('vehicle_plate', $vehicle->plate)
            ->latest('departure_date')
            ->limit(10)
            ->get()
            ->map(fn (Trip $t) => [
                'id'             => $t->id,
                'trip_number'    => $t->trip_number,
                'status'         => $t->status,
                'route_from'     => $t->route_from,
                'route_to'       => $t->route_to,
                'departure_date' => $t->departure_date?->toDateString(),
                'arrival_date'   => $t->arrival_date?->toDateString(),
            ]);

        $data = $this->summarize($vehicle) + [
            'chassis_number'       => $vehicle->chassis_number,
            'engine_number'        => $vehicle->engine_number,
            'fuel_tank_capacity_l' => $vehicle->fuel_tank_capacity_l,
            'owner_name'           => $vehicle->owner_name,
            'notes'                => $vehicle->notes,
            'driver_phone'         => $vehicle->driver?->phone,
            'gps_lat'              => $vehicle->gps_lat !== null ? (float) $vehicle->gps_lat : null,
            'gps_lng'              => $vehicle->gps_lng !== null ? (float) $vehicle->gps_lng : null,
            'gps_last_seen'        => $vehicle->gps_last_seen?->toIso8601String(),
            'gps_location_name'    => $vehicle->gps_location_name,
            'trips'                => $trips,
        ];

        return response()->json([
            'vehicle' => $data,
        ]);
    }

    // Shared flat shape used by both list and detail responses.
    private function summarize(Vehicle $v): array
    {
        return [
            'id'                => $v->id,
            'plate'             => $v->plate,
            'status'            => $v->status,
            'status_label'      => Vehicle::$statuses[$v->status]['label'] ?? $v->status,
            'status_color'      => Vehicle::$statuses[$v->status]['color'] ?? null,
            'make'              => $v->make,
            'model_name'        => $v->model_name,
            'year'              => $v->year,
            'type'              => $v->type,
            'color'             => $v->color,
            'driver_id'         => $v->driver_id,
            'driver_name'       => $v->driver?->name,
            'mileage_km'        => $v->mileage_km,
            'payload_tons'      => $v->payload_tons !== null ? (float) $v->payload_tons : null,
            'fuel_type'         => $v->fuel_type,
            'next_service_date' => $v->next_service_date?->toDateString(),
            'documents'         => $this->documents($v),
        ];
    }

    // Statutory documents flattened to { key, label, expiry, days } where `days`
    // is signed (negative = overdue). Missing expiry dates are omitted so the
    // mobile screen only renders documents that actually exist on the record.
    private function documents(Vehicle $v): array
    {
        $today = now()->startOfDay();
        $docs = [];

        foreach (self::DOCUMENTS as $key => [$label, $field]) {
            $date = $v->{$field};
            if (! $date) {
                continue;
            }
            $docs[] = [
                'key'    => $key,
                'label'  => $label,
                'expiry' => $date->toDateString(),
                'days'   => (int) $today->diffInDays($date->copy()->startOfDay(), false),
            ];
        }

        return $docs;
    }
}

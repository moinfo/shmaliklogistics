<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\TripCheckIn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Trip Check-In endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\TripCheckInController
/// but returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by route middleware — don't re-check here.
class CheckInController extends Controller
{
    /// GET /api/staff/modules/check-ins — newest-first list of driver check-ins.
    public function index(Request $request): JsonResponse
    {
        $query = TripCheckIn::with([
            'trip:id,trip_number,route_from,route_to,status',
            'driver:id,name,phone',
            'vehicle:id,plate',
        ])->latest('checked_in_at');

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->filled('trip_id')) {
            $query->where('trip_id', $request->trip_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $checkIns = $query->paginate(30)->withQueryString();

        $checkIns->getCollection()->transform(
            fn (TripCheckIn $checkIn) => $this->summarize($checkIn)
        );

        $stats = [
            'today'     => TripCheckIn::whereDate('checked_in_at', today())->count(),
            'issues'    => TripCheckIn::where('status', 'issue')->count(),
            'emergency' => TripCheckIn::where('status', 'emergency')->count(),
            'total'     => TripCheckIn::count(),
        ];

        return response()->json([
            'check_ins' => $checkIns,
            'stats'     => $stats,
            'statuses'  => TripCheckIn::$statuses,
        ]);
    }

    /// Shared flat shape: related names flattened inline so the mobile list can
    /// render trip / route / driver without nested objects.
    private function summarize(TripCheckIn $checkIn): array
    {
        $statusMeta = TripCheckIn::$statuses[$checkIn->status] ?? null;

        return [
            'id'            => $checkIn->id,
            'trip_id'       => $checkIn->trip_id,
            'trip_number'   => $checkIn->trip?->trip_number,
            'route_from'    => $checkIn->trip?->route_from,
            'route_to'      => $checkIn->trip?->route_to,
            'driver_id'     => $checkIn->driver_id,
            'driver_name'   => $checkIn->driver?->name,
            'driver_phone'  => $checkIn->driver?->phone,
            'vehicle_id'    => $checkIn->vehicle_id,
            'vehicle_plate' => $checkIn->vehicle?->plate,
            'status'        => $checkIn->status,
            'status_label'  => $statusMeta['label'] ?? $checkIn->status,
            'status_color'  => $statusMeta['color'] ?? null,
            'lat'           => $checkIn->lat !== null ? (float) $checkIn->lat : null,
            'lng'           => $checkIn->lng !== null ? (float) $checkIn->lng : null,
            'location'      => $checkIn->location,
            'odometer_km'   => $checkIn->odometer_km,
            'notes'         => $checkIn->notes,
            'checked_in_at' => optional($checkIn->checked_in_at)->toIso8601String(),
        ];
    }
}

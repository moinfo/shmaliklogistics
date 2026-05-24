<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;

/**
 * Read-only staff API for vehicle service / maintenance records.
 *
 * Mirrors the data of System\MaintenanceController but returns flat JSON
 * envelopes for the mobile app. Auth/scope is enforced by the route's
 * `permission:` middleware.
 */
class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRecord::with('vehicle')->latest('service_date');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('service_type', 'like', "%{$s}%")
                  ->orWhere('workshop_name', 'like', "%{$s}%")
                  ->orWhereHas('vehicle', fn ($vq) => $vq->where('plate', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        $records = $query->paginate(20)->withQueryString();

        $records->getCollection()->transform(fn ($r) => $this->transform($r));

        return response()->json(['maintenance' => $records]);
    }

    public function show($id)
    {
        $record = ServiceRecord::with('vehicle')->findOrFail($id);

        return response()->json(['record' => $this->transform($record)]);
    }

    /**
     * Flatten a service record for the mobile client. Adds `vehicle_plate`
     * (+ make/model) and a derived `status` based on the next service date,
     * since the table has no explicit status column.
     */
    private function transform(ServiceRecord $r): array
    {
        $vehicle = $r->vehicle;

        return [
            'id'                   => $r->id,
            'vehicle_id'           => $r->vehicle_id,
            'vehicle_plate'        => $vehicle?->plate,
            'vehicle_make'         => $vehicle?->make,
            'vehicle_model'        => $vehicle?->model_name,
            'service_type'         => $r->service_type,
            'service_date'         => optional($r->service_date)->toDateString(),
            'odometer_km'          => $r->mileage_km,
            'mileage_km'           => $r->mileage_km,
            'workshop_name'        => $r->workshop_name,
            'description'          => $r->description,
            'cost'                 => $r->cost,
            'currency'             => $r->currency,
            'next_service_date'    => optional($r->next_service_date)->toDateString(),
            'next_service_mileage' => $r->next_service_mileage,
            'status'               => $this->deriveStatus($r),
            'notes'                => $r->notes,
            'created_at'           => optional($r->created_at)->toIso8601String(),
        ];
    }

    private function deriveStatus(ServiceRecord $r): string
    {
        if (! $r->next_service_date) {
            return 'completed';
        }

        $next = $r->next_service_date;
        if ($next->isPast()) {
            return 'overdue';
        }
        if ($next->lessThanOrEqualTo(now()->addDays(14))) {
            return 'due_soon';
        }

        return 'scheduled';
    }
}

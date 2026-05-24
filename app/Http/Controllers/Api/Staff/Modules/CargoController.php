<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use App\Models\CargoStatusLog;
use Illuminate\Http\Request;

class CargoController extends Controller
{
    /**
     * GET /staff/modules/cargo
     * Returns: { "cargo": { "data": [...] } } (paginator).
     */
    public function index(Request $request)
    {
        $query = Cargo::with([
            'trip:id,trip_number,route_from,route_to',
            'client:id,name,company_name',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('cargo_number', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('consignee_name', 'like', "%{$s}%")
                  ->orWhere('origin', 'like', "%{$s}%")
                  ->orWhere('destination', 'like', "%{$s}%");
            });
        }

        $cargo = $query->paginate(20)->withQueryString();

        $cargo->getCollection()->transform(function (Cargo $item) {
            return $this->transform($item, withLogs: false);
        });

        return response()->json(['cargo' => $cargo]);
    }

    /**
     * GET /staff/modules/cargo/{id}
     * Returns: { "cargo": { ..., "status_logs": [...] } }.
     */
    public function show($id)
    {
        $cargo = Cargo::with([
            'trip:id,trip_number,route_from,route_to,status,driver_name,vehicle_plate',
            'client:id,name,company_name,phone,email',
            'creator:id,name',
        ])->findOrFail($id);

        $statusLogs = CargoStatusLog::where('cargo_id', $cargo->id)
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json([
            'cargo' => $this->transform($cargo, withLogs: true, statusLogs: $statusLogs),
        ]);
    }

    /**
     * Flatten a cargo row into the mobile-friendly shape. When [$withLogs] is
     * true the trip/consignee detail fields and the status-change timeline are
     * appended so the detail screen can render a full record.
     */
    private function transform(Cargo $cargo, bool $withLogs, $statusLogs = null): array
    {
        $statusMeta = Cargo::$statuses[$cargo->status] ?? null;
        $typeMeta   = Cargo::$types[$cargo->type] ?? null;

        $data = [
            'id'             => $cargo->id,
            'cargo_number'   => $cargo->cargo_number,
            'description'    => $cargo->description,
            'type'           => $cargo->type,
            'type_label'     => $typeMeta['label'] ?? $cargo->type,
            'type_color'     => $typeMeta['color'] ?? null,
            'status'         => $cargo->status,
            'status_label'   => $statusMeta['label'] ?? $cargo->status,
            'status_color'   => $statusMeta['color'] ?? null,
            'weight_kg'      => $cargo->weight_kg !== null ? (float) $cargo->weight_kg : null,
            'volume_m3'      => $cargo->volume_m3 !== null ? (float) $cargo->volume_m3 : null,
            'pieces'         => $cargo->pieces,
            'packing_type'   => $cargo->packing_type,
            'origin'         => $cargo->origin,
            'destination'    => $cargo->destination,
            'trip_id'        => $cargo->trip_id,
            'trip_number'    => $cargo->trip?->trip_number,
            'route_from'     => $cargo->trip?->route_from ?? $cargo->origin,
            'route_to'       => $cargo->trip?->route_to ?? $cargo->destination,
            'client_id'      => $cargo->client_id,
            'client_name'    => $cargo->client?->company_name ?: $cargo->client?->name,
            'created_at'     => optional($cargo->created_at)->toIso8601String(),
        ];

        if ($withLogs) {
            $data['consignee_name']       = $cargo->consignee_name;
            $data['consignee_contact']    = $cargo->consignee_contact;
            $data['declared_value']       = $cargo->declared_value !== null ? (float) $cargo->declared_value : null;
            $data['currency']             = $cargo->currency;
            $data['special_instructions'] = $cargo->special_instructions;
            $data['notes']                = $cargo->notes;
            $data['client_phone']         = $cargo->client?->phone;
            $data['client_email']         = $cargo->client?->email;
            $data['trip_status']          = $cargo->trip?->status;
            $data['driver_name']          = $cargo->trip?->driver_name;
            $data['vehicle_plate']        = $cargo->trip?->vehicle_plate;
            $data['created_by_name']      = $cargo->creator?->name;

            $logs = $statusLogs ?? collect();
            $data['status_logs'] = $logs->map(function (CargoStatusLog $log) {
                $meta = Cargo::$statuses[$log->status] ?? null;
                return [
                    'id'           => $log->id,
                    'status'       => $log->status,
                    'status_label' => $meta['label'] ?? $log->status,
                    'status_color' => $meta['color'] ?? null,
                    'location'     => $log->location,
                    'notes'        => $log->notes,
                    'user_name'    => $log->user?->name,
                    'created_at'   => optional($log->created_at)->toIso8601String(),
                ];
            })->values();
        }

        return $data;
    }
}

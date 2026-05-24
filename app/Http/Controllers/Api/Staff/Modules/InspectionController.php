<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\VehicleInspection;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    /**
     * GET /staff/modules/inspections
     * Returns: { "inspections": { "data": [...] } } (paginator).
     */
    public function index(Request $request)
    {
        $query = VehicleInspection::with([
            'vehicle:id,plate,make,model_name',
            'driver:id,name,phone',
        ])->latest('inspected_at');

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

        $inspections->getCollection()->transform(function (VehicleInspection $inspection) {
            return $this->transform($inspection, withItems: false);
        });

        return response()->json(['inspections' => $inspections]);
    }

    /**
     * GET /staff/modules/inspections/{id}
     * Returns: { "inspection": { ..., "items": [ { section, items[] } ] } }.
     */
    public function show($id)
    {
        $inspection = VehicleInspection::with([
            'vehicle:id,plate,make,model_name,type',
            'driver:id,name,phone,photo_path',
            'trip:id,trip_number,route_from,route_to',
            'creator:id,name',
        ])->findOrFail($id);

        return response()->json([
            'inspection' => $this->transform($inspection, withItems: true),
        ]);
    }

    /**
     * Flatten an inspection into the mobile-friendly shape. When [$withItems]
     * is true, the checklist is expanded into grouped sections with a per-item
     * status (ok / issue / pending) so the detail screen can render and color
     * each line.
     */
    private function transform(VehicleInspection $inspection, bool $withItems): array
    {
        $statusMeta = VehicleInspection::$statuses[$inspection->overall_status] ?? null;
        $typeMeta   = VehicleInspection::$types[$inspection->inspection_type] ?? null;

        $data = [
            'id'                  => $inspection->id,
            'vehicle_id'          => $inspection->vehicle_id,
            'vehicle_plate'       => $inspection->vehicle?->plate,
            'vehicle_make'        => $inspection->vehicle?->make,
            'vehicle_model'       => $inspection->vehicle?->model_name,
            'driver_id'           => $inspection->driver_id,
            'inspector_name'      => $inspection->driver?->name,
            'inspector_phone'     => $inspection->driver?->phone,
            'inspection_type'     => $inspection->inspection_type,
            'inspection_type_label' => $typeMeta['label'] ?? $inspection->inspection_type,
            'inspection_type_color' => $typeMeta['color'] ?? null,
            'overall_status'      => $inspection->overall_status,
            'overall_status_label' => $statusMeta['label'] ?? $inspection->overall_status,
            'overall_status_color' => $statusMeta['color'] ?? null,
            'odometer_km'         => $inspection->odometer_km,
            'location'            => $inspection->location,
            'inspected_at'        => optional($inspection->inspected_at)->toIso8601String(),
            'notes'               => $inspection->notes,
        ];

        if ($withItems) {
            $raw = $inspection->items ?? [];

            $issueCount = 0;
            $okCount    = 0;
            $sections   = [];

            foreach (VehicleInspection::$checklistSections as $key => $section) {
                $items = [];
                foreach ($section['items'] as $itemKey => $itemLabel) {
                    $status = $raw[$itemKey] ?? null;
                    if ($status === 'ok') {
                        $okCount++;
                    } elseif ($status === 'issue') {
                        $issueCount++;
                    }
                    $items[] = [
                        'key'        => $itemKey,
                        'label'      => $itemLabel,
                        'status'     => $status, // 'ok' | 'issue' | null
                        'ok_label'   => $section['options']['ok'] ?? 'Good',
                        'issue_label' => $section['options']['issue'] ?? 'Needs Attention',
                    ];
                }
                $sections[] = [
                    'key'   => $key,
                    'title' => $section['title'],
                    'items' => $items,
                ];
            }

            $data['items']        = $sections;
            $data['ok_count']     = $okCount;
            $data['issue_count']  = $issueCount;
            $data['trip_number']  = $inspection->trip?->trip_number;
            $data['route_from']   = $inspection->trip?->route_from;
            $data['route_to']     = $inspection->trip?->route_to;
            $data['created_by_name'] = $inspection->creator?->name;
        }

        return $data;
    }
}

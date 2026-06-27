<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleHandover;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleHandoverController extends Controller
{
    public function create(Vehicle $vehicle)
    {
        $vehicle->load('driver');
        $d = $vehicle->driver;

        return Inertia::render('system/Fleet/Handover/Create', [
            'vehicle'            => $vehicle->only(['id', 'plate', 'make', 'model_name', 'type', 'mileage_km']),
            'prefill'            => [
                'driver_name'          => $d?->name,
                'license_number'       => $d?->license_number,
                'license_class'        => $d?->license_class ?: implode(', ', $d?->license_classes ?? []),
                'license_expiry'       => optional($d?->license_expiry)->format('Y-m-d'),
                'vehicle_registration' => $vehicle->plate,
                'odometer_km'          => $vehicle->mileage_km,
            ],
            'inspectionItems'    => VehicleHandover::$inspectionItems,
            'documentationItems' => VehicleHandover::$documentationItems,
            'statusOptions'      => VehicleHandover::$statusOptions,
        ]);
    }

    public function store(Request $request, Vehicle $vehicle)
    {
        $data = $this->validateData($request);

        $data['vehicle_id'] = $vehicle->id;
        $data['driver_id']  = $vehicle->driver_id;
        $data['created_by'] = $request->user()->id;

        $handover = VehicleHandover::create($data);

        return redirect()->route('system.fleet.show', $vehicle)
            ->with('success', "Handover report #{$handover->id} saved.");
    }

    public function show(VehicleHandover $handover)
    {
        $handover->load(['vehicle', 'creator:id,name']);

        return Inertia::render('system/Fleet/Handover/Show', [
            'handover'           => $handover,
            'inspectionItems'    => VehicleHandover::$inspectionItems,
            'documentationItems' => VehicleHandover::$documentationItems,
            'statusOptions'      => VehicleHandover::$statusOptions,
        ]);
    }

    public function export(Request $request, VehicleHandover $handover)
    {
        $handover->load('vehicle');
        $labels = VehicleHandover::$statusOptions;
        $line = fn ($items, $stored) => collect($items)->map(fn ($label, $key) => [
            'item'    => $label,
            'status'  => $labels[$stored[$key]['status'] ?? '']['label'] ?? '—',
            'remarks' => $stored[$key]['remarks'] ?? '',
        ])->values()->all();

        $report = [
            'title'       => 'Vehicle Handover Report',
            'subtitle'    => "{$handover->vehicle->plate} · " . $handover->created_at->format('d M Y'),
            'filename'    => "handover-{$handover->vehicle->plate}-{$handover->id}",
            'orientation' => 'portrait',
            'summary'     => [
                'Vehicle'          => $handover->vehicle->plate,
                'Driver'           => $handover->driver_name ?: '—',
                'License No.'      => $handover->license_number ?: '—',
                'Odometer (KM)'    => $handover->odometer_km,
                'Fuel Level'       => $handover->fuel_level ?: '—',
                'Route'            => $handover->route_destination ?: '—',
                'Handed Over By'   => $handover->handed_over_by ?: '—',
                'Received By'      => $handover->received_by ?: '—',
            ],
            'sections'    => [
                [
                    'heading' => 'Vehicle Inspection Checklist',
                    'columns' => [
                        ['label' => 'Inspection Item', 'key' => 'item',    'type' => 'text'],
                        ['label' => 'Status',          'key' => 'status',  'type' => 'text'],
                        ['label' => 'Remarks',         'key' => 'remarks', 'type' => 'text'],
                    ],
                    'rows' => $line(VehicleHandover::$inspectionItems, $handover->inspection ?? []),
                ],
                [
                    'heading' => 'Documentation Checklist',
                    'columns' => [
                        ['label' => 'Inspection Item', 'key' => 'item',    'type' => 'text'],
                        ['label' => 'Status',          'key' => 'status',  'type' => 'text'],
                        ['label' => 'Remarks',         'key' => 'remarks', 'type' => 'text'],
                    ],
                    'rows' => $line(VehicleHandover::$documentationItems, $handover->documentation ?? []),
                ],
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
    }

    public function destroy(VehicleHandover $handover)
    {
        $vehicle = $handover->vehicle;
        $handover->delete();

        return redirect()->route('system.fleet.show', $vehicle)
            ->with('success', 'Handover report deleted.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'driver_name'           => 'nullable|string|max:150',
            'license_number'        => 'nullable|string|max:60',
            'license_class'         => 'nullable|string|max:40',
            'license_expiry'        => 'nullable|date',
            'vehicle_registration'  => 'nullable|string|max:30',
            'horse_trailer'         => 'nullable|string|max:60',
            'odometer_km'           => 'nullable|integer|min:0',
            'fuel_level'            => 'nullable|string|max:30',
            'route_destination'     => 'nullable|string|max:255',
            'inspection'            => 'nullable|array',
            'inspection.*.status'   => 'nullable|in:ok,fail,na',
            'inspection.*.remarks'  => 'nullable|string|max:300',
            'documentation'             => 'nullable|array',
            'documentation.*.status'    => 'nullable|in:ok,fail,na',
            'documentation.*.remarks'   => 'nullable|string|max:300',
            'handed_over_by'        => 'nullable|string|max:150',
            'handed_over_date'      => 'nullable|date',
            'received_by'           => 'nullable|string|max:150',
            'received_date'         => 'nullable|date',
            'notes'                 => 'nullable|string',
        ]);
    }
}

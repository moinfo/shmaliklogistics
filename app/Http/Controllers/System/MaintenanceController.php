<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        $stats = [
            'total_records'  => ServiceRecord::count(),
            'total_cost_tzs' => ServiceRecord::where('currency', 'TZS')->sum('cost'),
            'this_month'     => ServiceRecord::where('currency', 'TZS')
                ->whereMonth('service_date', now()->month)
                ->whereYear('service_date', now()->year)
                ->sum('cost'),
            'due_soon'       => Vehicle::whereNotNull('next_service_date')
                ->where('next_service_date', '<=', now()->addDays(14))
                ->whereNotIn('status', ['retired'])
                ->count(),
        ];

        return Inertia::render('system/Maintenance/Index', [
            'records'  => $records,
            'stats'    => $stats,
            'vehicles' => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'types'    => ServiceRecord::$serviceTypes,
            'filters'  => $request->only(['search', 'vehicle_id']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/Maintenance/Create', [
            'vehicles' => Vehicle::whereNotIn('status', ['retired'])->orderBy('plate')->get(['id', 'plate', 'make', 'model_name', 'mileage_km', 'next_service_date']),
            'types'    => ServiceRecord::$serviceTypes,
            'prefillVehicleId' => $request->vehicle_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'service_type'         => 'required|string|max:80',
            'service_date'         => 'required|date',
            'mileage_km'           => 'nullable|integer|min:0',
            'workshop_name'        => 'nullable|string|max:150',
            'description'          => 'nullable|string',
            'cost'                 => 'nullable|numeric|min:0',
            'currency'             => 'required|string|max:10',
            'next_service_date'    => 'nullable|date|after:service_date',
            'next_service_mileage' => 'nullable|integer|min:0',
            'notes'                => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $record = ServiceRecord::create($data);

        // Update vehicle's next_service_date and mileage_km if provided
        $vehicle = Vehicle::find($data['vehicle_id']);
        $updates = [];
        if (!empty($data['next_service_date'])) {
            $updates['next_service_date'] = $data['next_service_date'];
        }
        if (!empty($data['mileage_km'])) {
            $updates['mileage_km'] = $data['mileage_km'];
        }
        if ($updates) $vehicle->update($updates);

        return redirect()->route('system.maintenance.index')
            ->with('success', "Service record added for {$vehicle->plate}.");
    }

    public function show(ServiceRecord $maintenance)
    {
        $maintenance->load('vehicle');
        return Inertia::render('system/Maintenance/Show', [
            'record' => $maintenance,
        ]);
    }

    public function edit(ServiceRecord $maintenance)
    {
        return Inertia::render('system/Maintenance/Edit', [
            'record'   => $maintenance,
            'vehicles' => Vehicle::whereNotIn('status', ['retired'])->orderBy('plate')->get(['id', 'plate', 'make', 'model_name', 'mileage_km']),
            'types'    => ServiceRecord::$serviceTypes,
        ]);
    }

    public function update(Request $request, ServiceRecord $maintenance)
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'service_type'         => 'required|string|max:80',
            'service_date'         => 'required|date',
            'mileage_km'           => 'nullable|integer|min:0',
            'workshop_name'        => 'nullable|string|max:150',
            'description'          => 'nullable|string',
            'cost'                 => 'nullable|numeric|min:0',
            'currency'             => 'required|string|max:10',
            'next_service_date'    => 'nullable|date|after:service_date',
            'next_service_mileage' => 'nullable|integer|min:0',
            'notes'                => 'nullable|string',
        ]);

        $maintenance->update($data);

        return redirect()->route('system.maintenance.index')
            ->with('success', 'Service record updated.');
    }

    public function destroy(ServiceRecord $maintenance)
    {
        $maintenance->delete();
        return back()->with('success', 'Service record deleted.');
    }
}

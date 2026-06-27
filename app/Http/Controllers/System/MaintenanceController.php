<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Vehicle;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $validated = $request->validate([
            'records'                        => 'required|array|min:1',
            'records.*.vehicle_id'           => 'required|exists:vehicles,id',
            'records.*.service_type'         => 'required|string|max:80',
            'records.*.service_date'         => 'required|date',
            'records.*.mileage_km'           => 'nullable|integer|min:0',
            'records.*.workshop_name'        => 'nullable|string|max:150',
            'records.*.description'          => 'nullable|string',
            'records.*.cost'                 => 'nullable|numeric|min:0',
            'records.*.currency'             => 'required|string|max:10',
            'records.*.next_service_date'    => 'nullable|date',
            'records.*.next_service_mileage' => 'nullable|integer|min:0',
            'records.*.notes'                => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            foreach ($validated['records'] as $rec) {
                $rec['created_by'] = $request->user()->id;
                ServiceRecord::create($rec);
            }

            // Roll the latest service entry per vehicle up onto that vehicle.
            collect($validated['records'])->groupBy('vehicle_id')->each(function ($recs, $vehicleId) {
                $latest  = collect($recs)->sortByDesc('service_date')->first();
                $updates = [];
                if (! empty($latest['next_service_date'])) $updates['next_service_date'] = $latest['next_service_date'];
                if (! empty($latest['mileage_km']))        $updates['mileage_km']        = $latest['mileage_km'];
                if ($updates) Vehicle::where('id', $vehicleId)->update($updates);
            });
        });

        $count = count($validated['records']);
        return redirect()->route('system.maintenance.index')
            ->with('success', "{$count} service record" . ($count !== 1 ? 's' : '') . ' added.');
    }

    public function show(ServiceRecord $maintenance)
    {
        $maintenance->load('vehicle');
        return Inertia::render('system/Maintenance/Show', [
            'record' => $maintenance,
        ]);
    }

    public function export(Request $request, ServiceRecord $maintenance)
    {
        $maintenance->load('vehicle');
        $r = $maintenance;
        $v = $r->vehicle;
        $cur = $r->currency ?: 'TZS';

        $fmtDate = fn ($d) => $d ? \Carbon\Carbon::parse($d)->format('d M Y') : '—';

        $report = [
            'title'       => 'Service Record',
            'subtitle'    => ($v?->plate ?? 'Vehicle') . ' · ' . $r->service_type . ' · ' . $fmtDate($r->service_date),
            'filename'    => 'service-record-' . $r->id . ($v?->plate ? '-' . str_replace(' ', '', $v->plate) : ''),
            'orientation' => 'portrait',
            'summary'     => [
                'Vehicle'              => trim(($v?->plate ?? '—') . ' — ' . ($v?->make ?? '') . ' ' . ($v?->model_name ?? '')),
                'Service Type'         => $r->service_type ?: '—',
                'Service Date'         => $fmtDate($r->service_date),
                'Odometer (km)'        => $r->mileage_km !== null ? number_format((float) $r->mileage_km) : '—',
                'Workshop'             => $r->workshop_name ?: '—',
                'Cost'                 => $r->cost !== null ? $cur . ' ' . number_format((float) $r->cost, 0) : '—',
                'Next Service Date'    => $fmtDate($r->next_service_date),
                'Next Service (km)'    => $r->next_service_mileage !== null ? number_format((float) $r->next_service_mileage) : '—',
                'Description'          => $r->description ?: '—',
                'Notes'                => $r->notes ?: '—',
                'Recorded'             => $fmtDate($r->created_at),
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
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

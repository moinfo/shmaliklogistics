<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FuelLogController extends Controller
{
    public function index(Request $request)
    {
        $query = FuelLog::with(['vehicle:id,plate,make,model_name', 'driver:id,name', 'trip:id,trip_number'])
            ->latest('log_date');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('station_name', 'like', "%{$s}%")
                  ->orWhereHas('vehicle', fn ($vq) => $vq->where('plate', 'like', "%{$s}%"));
            });
        }

        $logs = $query->paginate(20)->withQueryString();

        $stats = [
            'total_liters'    => (float) FuelLog::sum('liters'),
            'total_cost'      => (float) FuelLog::sum(DB::raw('liters * cost_per_liter')),
            'month_liters'    => (float) FuelLog::whereMonth('log_date', now()->month)->whereYear('log_date', now()->year)->sum('liters'),
            'month_cost'      => (float) FuelLog::whereMonth('log_date', now()->month)->whereYear('log_date', now()->year)->sum(DB::raw('liters * cost_per_liter')),
            'log_count'       => FuelLog::count(),
        ];

        return Inertia::render('system/Fleet/FuelLogs/Index', [
            'logs'      => $logs,
            'stats'     => $stats,
            'vehicles'  => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'filters'   => $request->only(['vehicle_id', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id'     => 'required|exists:vehicles,id',
            'driver_id'      => 'nullable|exists:drivers,id',
            'trip_id'        => 'nullable|exists:trips,id',
            'log_date'       => 'required|date',
            'liters'         => 'required|numeric|min:1',
            'cost_per_liter' => 'required|numeric|min:0',
            'odometer_km'    => 'nullable|integer|min:0',
            'station_name'   => 'nullable|string|max:150',
            'fuel_type'      => 'required|in:diesel,petrol,cng',
            'currency'       => 'required|string|max:10',
            'notes'          => 'nullable|string|max:500',
        ]);

        $data['created_by'] = auth()->id();
        FuelLog::create($data);

        return back()->with('success', 'Fuel log recorded.');
    }

    public function destroy(FuelLog $fuelLog)
    {
        $fuelLog->delete();
        return back()->with('success', 'Fuel log deleted.');
    }
}

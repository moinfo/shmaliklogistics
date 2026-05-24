<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\FuelLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/// Read-only Fuel Log endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\FuelLogController but
/// returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by route middleware (permission:fleet_fuel_logs.view).
class FuelLogController extends Controller
{
    // GET /api/staff/modules/fuel-logs — searchable list, newest first, with fleet-wide totals.
    public function index(Request $request): JsonResponse
    {
        $query = FuelLog::with([
            'vehicle:id,plate,make,model_name',
            'driver:id,name',
            'trip:id,trip_number',
        ])->latest('log_date');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('station_name', 'like', "%{$s}%")
                  ->orWhereHas('vehicle', fn ($vq) => $vq->where('plate', 'like', "%{$s}%"));
            });
        }

        $logs = $query->get()->map(fn (FuelLog $log) => $this->summarize($log));

        $stats = [
            'total_liters' => (float) FuelLog::sum('liters'),
            'total_cost'   => (float) FuelLog::sum(DB::raw('liters * cost_per_liter')),
            'month_liters' => (float) FuelLog::whereMonth('log_date', now()->month)
                ->whereYear('log_date', now()->year)
                ->sum('liters'),
            'month_cost'   => (float) FuelLog::whereMonth('log_date', now()->month)
                ->whereYear('log_date', now()->year)
                ->sum(DB::raw('liters * cost_per_liter')),
            'log_count'    => FuelLog::count(),
        ];

        return response()->json([
            'fuel_logs'  => $logs,
            'stats'      => $stats,
            'fuel_types' => FuelLog::$fuelTypes,
        ]);
    }

    // Shared flat shape: related names flattened inline, money as numbers.
    private function summarize(FuelLog $log): array
    {
        $liters       = (float) $log->liters;
        $costPerLiter = (float) $log->cost_per_liter;

        return [
            'id'             => $log->id,
            'vehicle_id'     => $log->vehicle_id,
            'vehicle_plate'  => $log->vehicle?->plate,
            'vehicle_make'   => $log->vehicle?->make,
            'vehicle_model'  => $log->vehicle?->model_name,
            'driver_id'      => $log->driver_id,
            'driver_name'    => $log->driver?->name,
            'trip_id'        => $log->trip_id,
            'trip_number'    => $log->trip?->trip_number,
            'log_date'       => $log->log_date?->toDateString(),
            'liters'         => $liters,
            'cost_per_liter' => $costPerLiter,
            'total_cost'     => round($liters * $costPerLiter, 2),
            'odometer_km'    => $log->odometer_km,
            'station'        => $log->station_name,
            'fuel_type'      => $log->fuel_type,
            'currency'       => $log->currency,
            'notes'          => $log->notes,
        ];
    }
}

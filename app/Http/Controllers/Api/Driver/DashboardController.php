<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\VehicleInspection;
use App\Services\DriverAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $driver = $request->user()->driver->load(['vehicle:id,plate,make,model_name,type']);

        $active = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->with('vehicle:id,plate,make,model_name')
            ->orderBy('departure_date')
            ->get();

        $upcoming = Trip::where('driver_id', $driver->id)
            ->where('status', 'planned')
            ->with('vehicle:id,plate,make,model_name')
            ->orderBy('departure_date')
            ->limit(5)
            ->get();

        $recent = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->with('vehicle:id,plate,make,model_name')
            ->latest('departure_date')
            ->limit(5)
            ->get();

        $todayInspection = $driver->vehicle
            ? VehicleInspection::where('vehicle_id', $driver->vehicle->id)
                ->where('driver_id', $driver->id)
                ->whereDate('inspected_at', today())
                ->where('inspection_type', 'pre_trip')
                ->latest('inspected_at')
                ->first()
            : null;

        return response()->json([
            'driver'           => $driver,
            'active_trips'     => $active,
            'upcoming_trips'   => $upcoming,
            'recent_trips'     => $recent,
            'today_inspection' => $todayInspection,
            'alerts'           => DriverAlertService::for($driver),
            'stats'            => [
                'active_trips'    => $active->count(),
                'upcoming_trips'  => Trip::where('driver_id', $driver->id)->where('status', 'planned')->count(),
                'completed_month' => Trip::where('driver_id', $driver->id)
                    ->whereIn('status', ['delivered', 'completed'])
                    ->whereMonth('departure_date', now()->month)
                    ->whereYear('departure_date', now()->year)
                    ->count(),
            ],
            'trip_statuses' => Trip::$statuses,
        ]);
    }
}
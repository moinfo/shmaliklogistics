<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Permit;
use App\Models\Trip;
use App\Models\TripCheckIn;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpsController extends Controller
{
    // Active statuses considered "live" operations.
    private const LIVE_STATUSES = ['planned', 'loading', 'in_transit', 'at_border'];

    // GET /api/staff/ops/trips — live/active trips, newest first.
    public function trips(Request $request): JsonResponse
    {
        $trips = Trip::query()
            ->whereIn('status', self::LIVE_STATUSES)
            ->with(['driver:id,name,phone', 'vehicle:id,plate,make,model_name,type'])
            ->latest('departure_date')
            ->get()
            ->map(function (Trip $t) {
                return [
                    'id'             => $t->id,
                    'trip_number'    => $t->trip_number,
                    'status'         => $t->status,
                    'route_from'     => $t->route_from,
                    'route_to'       => $t->route_to,
                    'departure_date' => $t->departure_date?->toDateString(),
                    'arrival_date'   => $t->arrival_date?->toDateString(),
                    'vehicle_plate'  => $t->vehicle?->plate ?? $t->vehicle_plate,
                    'driver_name'    => $t->driver?->name ?? $t->driver_name,
                    'driver_phone'   => $t->driver?->phone,
                    'cargo_description' => $t->cargo_description,
                ];
            });

        return response()->json([
            'trips'         => $trips,
            'trip_statuses' => Trip::$statuses,
        ]);
    }

    // GET /api/staff/ops/fleet — vehicles with status, assignment and last fuel.
    public function fleet(Request $request): JsonResponse
    {
        $vehicles = Vehicle::query()
            ->with('driver:id,name,phone')
            ->orderBy('plate')
            ->get();

        // Most recent fuel log per vehicle in one query (read-only) to avoid N+1.
        $lastFuelByVehicle = FuelLog::whereIn('vehicle_id', $vehicles->pluck('id'))
            ->orderBy('log_date', 'desc')
            ->orderBy('id', 'desc')
            ->get(['vehicle_id', 'log_date', 'liters', 'odometer_km'])
            ->groupBy('vehicle_id')
            ->map(fn ($rows) => $rows->first());

        $vehicles = $vehicles->map(function (Vehicle $v) use ($lastFuelByVehicle) {
            $lastFuel = $lastFuelByVehicle[$v->id] ?? null;

            return [
                'id'             => $v->id,
                'plate'          => $v->plate,
                'status'         => $v->status,
                'make'           => $v->make,
                'model_name'     => $v->model_name,
                'type'           => $v->type,
                'mileage_km'     => $v->mileage_km,
                'driver_id'      => $v->driver_id,
                'driver_name'    => $v->driver?->name,
                'driver_phone'   => $v->driver?->phone,
                'last_odometer_km' => $lastFuel?->odometer_km ?? $v->mileage_km,
                'last_fuel_date'   => $lastFuel?->log_date?->toDateString(),
                'last_fuel_liters' => $lastFuel ? (float) $lastFuel->liters : null,
            ];
        });

        return response()->json([
            'vehicles'         => $vehicles,
            'vehicle_statuses' => Vehicle::$statuses,
        ]);
    }

    // GET /api/staff/ops/alerts — operational action list for ops/dispatch staff.
    // Mirrors the structure of App\Services\DriverAlertService::for().
    public function alerts(Request $request): JsonResponse
    {
        // OR-permission gate: the single-arg `permission:` route middleware can't
        // express "trips.view OR drivers.view", so enforce it here instead.
        abort_unless(
            $request->user()->hasPermission('trips.view')
                || $request->user()->hasPermission('drivers.view'),
            403,
            'You do not have permission to view operations alerts.'
        );

        $alerts = [];

        // 1) Driver licences / visas expiring (or expired) within 30 days.
        $soon = now()->addDays(30);
        $drivers = Driver::query()
            ->where(function ($q) use ($soon) {
                $q->whereNotNull('license_expiry')->where('license_expiry', '<=', $soon)
                  ->orWhere(function ($q2) use ($soon) {
                      $q2->whereNotNull('visa_expiry')->where('visa_expiry', '<=', $soon);
                  });
            })
            ->get(['id', 'name', 'license_expiry', 'visa_expiry']);

        foreach ($drivers as $driver) {
            if ($driver->license_expiry && $driver->license_expiry->lte($soon)) {
                $days = (int) now()->startOfDay()->diffInDays($driver->license_expiry->startOfDay(), false);
                $alerts[] = [
                    'id'       => "driver_license_{$driver->id}",
                    'kind'     => 'license',
                    'severity' => $days < 0 ? 'critical' : ($days <= 7 ? 'warning' : 'info'),
                    'title'    => $days < 0
                        ? "Leseni ya {$driver->name} imeisha muda"
                        : "Leseni ya {$driver->name} inakaribia kuisha",
                    'message'  => 'Leseni: ' . $driver->license_expiry->format('d M Y') . ' · ' . self::humanDays($days),
                    'href'     => "/system/drivers/{$driver->id}",
                    'cta'      => 'Ona Dereva',
                ];
            }
            if ($driver->visa_expiry && $driver->visa_expiry->lte($soon)) {
                $days = (int) now()->startOfDay()->diffInDays($driver->visa_expiry->startOfDay(), false);
                $alerts[] = [
                    'id'       => "driver_visa_{$driver->id}",
                    'kind'     => 'visa',
                    'severity' => $days < 0 ? 'critical' : ($days <= 7 ? 'warning' : 'info'),
                    'title'    => $days < 0
                        ? "Viza ya {$driver->name} imeisha muda"
                        : "Viza ya {$driver->name} inakaribia kuisha",
                    'message'  => 'Viza: ' . $driver->visa_expiry->format('d M Y') . ' · ' . self::humanDays($days),
                    'href'     => "/system/drivers/{$driver->id}",
                    'cta'      => 'Ona Dereva',
                ];
            }
        }

        // 2) Vehicle compliance docs expiring (insurance / licence / fitness / TRA / GVL).
        $docColumns = [
            'insurance_expiry'             => 'Bima',
            'road_licence_expiry'          => 'Leseni ya Barabara',
            'fitness_expiry'               => 'Ufaafu (Fitness)',
            'tra_sticker_expiry'           => 'Stika ya TRA',
            'goods_vehicle_licence_expiry' => 'Leseni ya Mizigo',
        ];

        $vehicles = Vehicle::query()
            ->where(function ($q) use ($soon, $docColumns) {
                foreach (array_keys($docColumns) as $col) {
                    $q->orWhere(function ($q2) use ($col, $soon) {
                        $q2->whereNotNull($col)->where($col, '<=', $soon);
                    });
                }
            })
            ->get(array_merge(['id', 'plate'], array_keys($docColumns)));

        foreach ($vehicles as $vehicle) {
            foreach ($docColumns as $col => $label) {
                $date = $vehicle->{$col};
                if (! $date || $date->gt($soon)) {
                    continue;
                }
                $days = (int) now()->startOfDay()->diffInDays($date->startOfDay(), false);
                $alerts[] = [
                    'id'       => "vehicle_{$col}_{$vehicle->id}",
                    'kind'     => 'vehicle_document',
                    'severity' => $days < 0 ? 'critical' : ($days <= 7 ? 'warning' : 'info'),
                    'title'    => $days < 0
                        ? "{$label} ya {$vehicle->plate} imeisha muda"
                        : "{$label} ya {$vehicle->plate} inakaribia kuisha",
                    'message'  => $label . ': ' . $date->format('d M Y') . ' · ' . self::humanDays($days),
                    'href'     => "/system/fleet/{$vehicle->id}",
                    'cta'      => 'Ona Gari',
                ];
            }
        }

        // 3) Permits expiring (or expired) within 30 days.
        $permits = Permit::query()
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $soon)
            ->whereIn('status', ['pending', 'active'])
            ->get(['id', 'permit_type', 'permit_number', 'vehicle_plate', 'expiry_date']);

        foreach ($permits as $permit) {
            $days = (int) now()->startOfDay()->diffInDays($permit->expiry_date->startOfDay(), false);
            $alerts[] = [
                'id'       => "permit_{$permit->id}",
                'kind'     => 'permit',
                'severity' => $days < 0 ? 'critical' : ($days <= 7 ? 'warning' : 'info'),
                'title'    => $days < 0
                    ? "Kibali {$permit->permit_number} kimeisha muda"
                    : "Kibali {$permit->permit_number} kinakaribia kuisha",
                'message'  => trim("{$permit->permit_type} · {$permit->vehicle_plate}") . ' · ' . self::humanDays($days),
                'href'     => "/system/permits/{$permit->id}",
                'cta'      => 'Ona Kibali',
            ];
        }

        // 4) Active trips with overdue driver check-ins.
        $activeTrips = Trip::query()
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->get(['id', 'trip_number', 'departure_date']);

        $lastCheckIns = TripCheckIn::whereIn('trip_id', $activeTrips->pluck('id'))
            ->orderBy('checked_in_at', 'desc')
            ->get()
            ->groupBy('trip_id')
            ->map(fn ($rows) => $rows->first()->checked_in_at);

        foreach ($activeTrips as $trip) {
            $last      = $lastCheckIns[$trip->id] ?? null;
            $reference = $last ? Carbon::parse($last) : Carbon::parse($trip->departure_date);
            $dueAt     = $reference->copy()->addHours(TripCheckIn::INTERVAL_HOURS);

            if (now()->greaterThan($dueAt)) {
                $minutesLate = abs(now()->diffInMinutes($dueAt));
                $alerts[] = [
                    'id'       => "trip_overdue_{$trip->id}",
                    'kind'     => 'trip_overdue',
                    'severity' => $minutesLate > 60 ? 'critical' : 'warning',
                    'title'    => "Check-in inahitajika: {$trip->trip_number}",
                    'message'  => $last
                        ? 'Imepitiliza muda kwa ' . self::humanMinutes($minutesLate)
                        : 'Hakuna check-in tangu safari ianze.',
                    'href'     => "/system/trips/{$trip->id}",
                    'cta'      => 'Ona Safari',
                ];
            }
        }

        return response()->json([
            'alerts' => [
                'items'     => $alerts,
                'count'     => count($alerts),
                'has_alert' => count($alerts) > 0,
            ],
        ]);
    }

    private static function humanDays(int $days): string
    {
        if ($days < 0)  return abs($days) . ' siku zilizopita';
        if ($days === 0) return 'leo';
        return "siku {$days} zimebaki";
    }

    private static function humanMinutes(int $min): string
    {
        if ($min < 60) return "{$min} min";
        $h = intdiv($min, 60);
        $m = $min % 60;
        return $m ? "{$h}h {$m}min" : "{$h}h";
    }
}

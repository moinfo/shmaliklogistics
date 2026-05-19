<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\TripCheckIn;
use App\Models\VehicleInspection;
use Carbon\Carbon;

class DriverAlertService
{
    // Computes the live action list shown in the driver-portal banner.
    public static function for(Driver $driver): array
    {
        $alerts = [];

        // 1) Morning vehicle inspection
        $todayInspection = VehicleInspection::where('driver_id', $driver->id)
            ->whereDate('inspected_at', today())
            ->where('inspection_type', 'pre_trip')
            ->exists();

        if (! $todayInspection) {
            $alerts[] = [
                'id'       => 'inspection_today',
                'kind'     => 'inspection',
                'severity' => 'warning',
                'title'    => 'Ukaguzi wa asubuhi haujafanyika',
                'message'  => 'Kabla ya kuanza safari, jaza ukaguzi wa gari.',
                'href'     => '/driver/inspections/create',
                'cta'      => 'Anza Ukaguzi',
            ];
        }

        // 2) Overdue check-in on any active trip
        $activeTrips = Trip::where('driver_id', $driver->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->get();

        // Fetch last check-in per trip in one query to avoid N+1.
        $lastCheckIns = TripCheckIn::whereIn('trip_id', $activeTrips->pluck('id'))
            ->orderBy('checked_in_at', 'desc')
            ->get()
            ->groupBy('trip_id')
            ->map(fn($rows) => $rows->first()->checked_in_at);

        foreach ($activeTrips as $trip) {
            $last = $lastCheckIns[$trip->id] ?? null;

            $reference   = $last ? Carbon::parse($last) : Carbon::parse($trip->departure_date);
            $dueAt       = $reference->copy()->addHours(TripCheckIn::INTERVAL_HOURS);
            $isOverdue   = now()->greaterThan($dueAt);
            $minutesLate = $isOverdue ? abs(now()->diffInMinutes($dueAt)) : 0;

            if ($isOverdue) {
                $alerts[] = [
                    'id'       => "checkin_due_{$trip->id}",
                    'kind'     => 'check_in',
                    'severity' => $minutesLate > 60 ? 'critical' : 'warning',
                    'title'    => "Check-in inahitajika kwa {$trip->trip_number}",
                    'message'  => $last
                        ? "Imepitiliza muda kwa " . self::humanMinutes($minutesLate)
                        : "Hujafanya check-in tangu safari ianze.",
                    'href'     => "/driver/check-ins/create?trip={$trip->id}",
                    'cta'      => 'Check-In Sasa',
                ];
            }
        }

        // 3) Newly assigned planned trip (within the last 12 hours)
        $newlyAssigned = Trip::where('driver_id', $driver->id)
            ->where('status', 'planned')
            ->where('updated_at', '>=', now()->subHours(12))
            ->orderBy('departure_date')
            ->first();

        if ($newlyAssigned) {
            $alerts[] = [
                'id'       => "trip_assigned_{$newlyAssigned->id}",
                'kind'     => 'trip_assigned',
                'severity' => 'info',
                'title'    => "Umepewa safari mpya: {$newlyAssigned->trip_number}",
                'message'  => "{$newlyAssigned->route_from} → {$newlyAssigned->route_to} · " .
                              ($newlyAssigned->departure_date?->format('d M Y') ?? '—'),
                'href'     => "/driver/trips/{$newlyAssigned->id}",
                'cta'      => 'Ona Safari',
            ];
        }

        return [
            'items'     => $alerts,
            'count'     => count($alerts),
            'has_alert' => count($alerts) > 0,
        ];
    }

    private static function humanMinutes(int $min): string
    {
        if ($min < 60) return "{$min} min";
        $h = intdiv($min, 60);
        $m = $min % 60;
        return $m ? "{$h}h {$m}min" : "{$h}h";
    }
}

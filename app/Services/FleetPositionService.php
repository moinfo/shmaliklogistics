<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Illuminate\Support\Collection;

/** Current position and moving / idle / parked / offline state of tracked vehicles. */
class FleetPositionService
{
    /** @return array<int,array<string,mixed>> every vehicle that has a position, ordered by plate */
    public function all(?array $vehicleIds = null): array
    {
        $vehicles = Vehicle::with('driver:id,name')
            ->whereNotNull('gps_lat')
            ->whereNotNull('gps_lng')
            ->when($vehicleIds !== null, fn ($q) => $q->whereIn('id', $vehicleIds))
            ->orderBy('plate')
            ->get();

        // Latest stored location per vehicle, for speed / heading / ignition.
        $latest = VehicleLocation::whereIn(
            'id',
            VehicleLocation::selectRaw('MAX(id)')->whereIn('vehicle_id', $vehicles->pluck('id'))->groupBy('vehicle_id')
        )->get()->keyBy('vehicle_id');

        return $vehicles->map(function (Vehicle $v) use ($latest) {
            $loc   = $latest->get($v->id);
            $speed = $loc?->speed_kmh !== null ? (float) $loc->speed_kmh : null;

            return [
                'id'          => $v->id,
                'plate'       => $v->plate,
                'make'        => $v->make,
                'type'        => $v->type,
                'status'      => $v->status,
                'driver'      => $v->driver?->name,
                'lat'         => (float) $v->gps_lat,
                'lng'         => (float) $v->gps_lng,
                'speed'       => $speed,
                'heading'     => $loc?->heading,
                'ignition'    => $loc?->ignition,
                'voltage_v'   => $loc?->external_voltage_mv ? round($loc->external_voltage_mv / 1000, 1) : null,
                'last_seen'   => $v->gps_last_seen?->toIso8601String(),
                'location'    => $v->gps_location_name,
                'road'        => $v->gps_road,
                'area'        => $v->gps_area,
                'live_device' => $loc !== null,     // false = position was typed in manually
                'state'       => $this->state($v->gps_last_seen, $speed, $loc?->ignition),
            ];
        })->values()->all();
    }

    public function state($lastSeen, ?float $speed, ?bool $ignition): string
    {
        $cfg = config('tracking');

        if (! $lastSeen || $lastSeen->lt(now()->subMinutes($cfg['offline_after_minutes']))) {
            return 'offline';
        }
        if ($speed !== null && $speed >= $cfg['moving_speed_kmh']) {
            return 'moving';
        }

        return $ignition === false ? 'parked' : 'idle';
    }

    /** @return array{moving:int,idle:int,parked:int,offline:int,total:int} */
    public function counts(?Collection $positions = null): array
    {
        $positions ??= collect($this->all());
        $counts = ['moving' => 0, 'idle' => 0, 'parked' => 0, 'offline' => 0];
        foreach ($positions as $p) {
            $counts[$p['state']]++;
        }

        return $counts + ['total' => $positions->count()];
    }
}

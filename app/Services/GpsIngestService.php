<?php

namespace App\Services;

use App\Jobs\ReverseGeocodeVehicle;
use App\Models\GpsDevice;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Cache;
use App\Support\Geo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Persists decoded GPS records: appends to vehicle_locations and keeps the
 * vehicles.gps_* "last known position" columns (shown on the Fleet pages) current.
 */
class GpsIngestService
{
    /** @param array<int,array<string,mixed>> $records output of TeltonikaService::decodePacket()['records'] */
    public function ingest(GpsDevice $device, array $records): int
    {
        $rows = [];
        foreach ($records as $r) {
            // No GPS fix — the device reports 0,0 with no satellites.
            if ($r['satellites'] === 0 || ($r['latitude'] == 0 && $r['longitude'] == 0)) {
                continue;
            }

            $ignition = $r['io'][TeltonikaService::IO_IGNITION] ?? null;

            $rows[] = [
                'gps_device_id'       => $device->id,
                'vehicle_id'          => $device->vehicle_id,
                'latitude'            => $r['latitude'],
                'longitude'           => $r['longitude'],
                'speed_kmh'           => $r['speed'],
                'heading'             => $r['heading'],
                'altitude_m'          => $r['altitude'],
                'satellites'          => $r['satellites'],
                'ignition'            => $ignition === null ? null : (bool) $ignition,
                'external_voltage_mv' => $r['io'][TeltonikaService::IO_EXTERNAL_VOLTAGE] ?? null,
                'io'                  => $r['io'] ? json_encode($r['io']) : null,
                'recorded_at'         => $r['timestamp']->format('Y-m-d H:i:s'),
                'created_at'          => now()->format('Y-m-d H:i:s'),
            ];
        }

        usort($rows, fn ($a, $b) => strcmp($a['recorded_at'], $b['recorded_at']));
        $prev = $rows ? DB::table('vehicle_locations')
            ->where('gps_device_id', $device->id)
            ->where('recorded_at', '<', $rows[0]['recorded_at'])
            ->orderByDesc('recorded_at')
            ->first(['latitude', 'longitude', 'recorded_at']) : null;
        foreach ($rows as &$row) {
            $row['distance_m'] = $this->legDistance($prev, $row);
            $prev = (object) $row;
        }
        unset($row);

        DB::transaction(function () use ($device, $rows) {
            // insertOrIgnore: a device re-sends records it never got an ack for.
            if ($rows) {
                DB::table('vehicle_locations')->insertOrIgnore($rows);
            }

            $device->forceFill(['last_ping' => now()])->save();

            if ($rows && $device->vehicle_id) {
                $latest = collect($rows)->sortByDesc('recorded_at')->first();

                // Only move the vehicle forward in time (a backlog upload must not rewind it).
                Vehicle::whereKey($device->vehicle_id)
                    ->where(fn ($q) => $q->whereNull('gps_last_seen')->orWhere('gps_last_seen', '<', $latest['recorded_at']))
                    ->update([
                        'gps_lat'       => $latest['latitude'],
                        'gps_lng'       => $latest['longitude'],
                        'gps_last_seen' => $latest['recorded_at'],
                    ]);
            }
        });

        if ($rows && $device->vehicle_id) {
            try {
                app(GpsEventService::class)->process($device, $rows);
            } catch (\Throwable $e) {
                // Alerting must never stop positions from being acknowledged and stored.
                Log::error('GPS event processing failed', ['error' => $e->getMessage()]);
            }

            $this->refreshPlaceName($device->vehicle_id, collect($rows)->sortByDesc('recorded_at')->first());
        }

        // Records are acknowledged even when skipped for having no fix — resending them would not help.
        return count($records);
    }

    /** Metres from the previous record, 0 for the first record or a GPS glitch (implausible jump). */
    private function legDistance(?object $prev, array $row): int
    {
        if (! $prev) {
            return 0;
        }

        $seconds = strtotime($row['recorded_at'] . ' UTC') - strtotime($prev->recorded_at . ' UTC');
        $metres  = Geo::distance((float) $prev->latitude, (float) $prev->longitude, $row['latitude'], $row['longitude']);

        if ($seconds <= 0 || $metres > 200000 || $metres / $seconds * 3.6 > 250) {
            return 0;
        }

        return (int) round($metres);
    }

    /** Look the place name up again only once the vehicle has moved ~200 m from the last lookup. */
    private function refreshPlaceName(int $vehicleId, array $latest): void
    {
        $key  = "geocoded:{$vehicleId}";
        $last = Cache::get($key);

        if ($last && abs($last[0] - $latest['latitude']) < 0.002 && abs($last[1] - $latest['longitude']) < 0.002) {
            return;
        }

        Cache::put($key, [$latest['latitude'], $latest['longitude']], now()->addDay());
        ReverseGeocodeVehicle::dispatch($vehicleId, $latest['latitude'], $latest['longitude']);
    }
}

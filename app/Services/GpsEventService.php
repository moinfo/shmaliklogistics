<?php

namespace App\Services;

use App\Models\Geofence;
use App\Models\GpsDevice;
use App\Models\GpsEvent;
use App\Models\Vehicle;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Turns a stream of positions into alert events: speeding, long idling, ignition after hours,
 * harsh driving and geofence entry / exit. The offline alert lives in the gps:check-offline command.
 *
 * Per-vehicle state (inside which zone, idle since when, last ignition) is kept in the cache so the
 * long-running listener does not have to re-read history on every packet.
 */
class GpsEventService
{
    /** Teltonika "Green driving" IO: 253 = type (1 accel, 2 braking, 3 cornering). */
    private const IO_GREEN_DRIVING_TYPE = 253;

    /** Records older than this are used to keep state in step but never raise alerts (backlog uploads). */
    private const FRESH_HOURS = 2;

    /** @param array<int,array<string,mixed>> $rows rows as built by GpsIngestService (recorded_at in UTC) */
    public function process(GpsDevice $device, array $rows): void
    {
        if (! $device->vehicle_id || ! $rows) {
            return;
        }

        $vehicle = Vehicle::find($device->vehicle_id, ['id', 'plate', 'driver_id']);
        if (! $vehicle) {
            return;
        }

        Cache::forget("gps:offline:{$vehicle->id}");   // it is talking again

        $geofences = Geofence::where('is_active', true)->get();
        $key       = "gps:state:{$vehicle->id}";
        $state     = Cache::get($key, ['geo' => [], 'idle_since' => null, 'idle_flagged' => false, 'ign' => null]);
        $cfg       = config('tracking');

        usort($rows, fn ($a, $b) => strcmp($a['recorded_at'], $b['recorded_at']));

        foreach ($rows as $r) {
            $at    = Carbon::parse($r['recorded_at'], 'UTC');
            $fresh = $at->gt(now()->subHours(self::FRESH_HOURS));
            $emit  = fn (string $type, string $severity, string $message, ?float $value = null, ?int $geofenceId = null)
                => $fresh && $this->record($vehicle, $type, $severity, $message, $r, $at, $value, $geofenceId);

            // ── Geofences ──────────────────────────────────────────────
            foreach ($geofences as $g) {
                $inside = Geo::insideCircle($r['latitude'], $r['longitude'], $g->center_lat, $g->center_lng, $g->radius_m);
                $was    = $state['geo'][$g->id] ?? null;   // null = first sighting: learn, don't alert

                if ($was !== null && $was !== $inside) {
                    if ($inside && $g->alert_on_enter) {
                        $emit('geofence_enter', 'info', "{$vehicle->plate} entered {$g->name}", null, $g->id);
                    } elseif (! $inside && $g->alert_on_exit) {
                        $emit('geofence_exit', 'info', "{$vehicle->plate} left {$g->name}", null, $g->id);
                    }
                }
                $state['geo'][$g->id] = $inside;
            }

            // ── Speeding (at most one alert per vehicle per 10 minutes) ─
            $speed = (float) ($r['speed_kmh'] ?? 0);
            if ($speed > $cfg['speed_limit_kmh'] && $fresh && Cache::add("gps:speed:{$vehicle->id}", 1, 600)) {
                $emit('speeding', 'warning', sprintf('%s at %d km/h (limit %d)', $vehicle->plate, $speed, $cfg['speed_limit_kmh']), $speed);
            }

            // ── Long idle: engine on, not moving ───────────────────────
            $ign = $r['ignition'];
            if ($ign === true && $speed < $cfg['moving_speed_kmh']) {
                $state['idle_since'] ??= $r['recorded_at'];
                $minutes = Carbon::parse($state['idle_since'], 'UTC')->diffInMinutes($at);
                if (! $state['idle_flagged'] && $minutes >= $cfg['idle_alert_minutes']) {
                    $state['idle_flagged'] = true;
                    $emit('idle', 'warning', "{$vehicle->plate} idling with engine on for {$minutes} min", (float) $minutes);
                }
            } else {
                $state['idle_since']   = null;
                $state['idle_flagged'] = false;
            }

            // ── Ignition switched on outside working hours ─────────────
            if ($ign === true && $state['ign'] === false) {
                $hour = $at->copy()->setTimezone($cfg['timezone'])->hour;
                if ($hour < $cfg['working_hours']['start'] || $hour >= $cfg['working_hours']['end']) {
                    $emit('ignition_after_hours', 'warning', sprintf('%s started at %02d:%02d', $vehicle->plate, $hour, $at->copy()->setTimezone($cfg['timezone'])->minute));
                }
            }
            if ($ign !== null) {
                $state['ign'] = $ign;
            }

            // ── Harsh driving reported by the device ───────────────────
            $io    = json_decode($r['io'] ?? 'null', true) ?: [];
            $harsh = [1 => 'harsh_acceleration', 2 => 'harsh_braking', 3 => 'harsh_cornering'][$io[self::IO_GREEN_DRIVING_TYPE] ?? 0] ?? null;
            if ($harsh) {
                $emit($harsh, 'warning', "{$vehicle->plate}: " . strtolower(GpsEvent::TYPES[$harsh][0]));
            }
        }

        Cache::put($key, $state, now()->addDay());
    }

    private function record(Vehicle $vehicle, string $type, string $severity, string $message, array $row, Carbon $at, ?float $value, ?int $geofenceId): bool
    {
        GpsEvent::create([
            'vehicle_id'  => $vehicle->id,
            'driver_id'   => $vehicle->driver_id,
            'geofence_id' => $geofenceId,
            'type'        => $type,
            'severity'    => $severity,
            'message'     => mb_substr($message, 0, 255),
            'latitude'    => $row['latitude'],
            'longitude'   => $row['longitude'],
            'value'       => $value,
            'occurred_at' => $at,
        ]);

        return true;
    }
}

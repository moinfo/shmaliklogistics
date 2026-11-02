<?php

namespace App\Console\Commands;

use App\Models\GpsDevice;
use App\Models\GpsEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class GpsCheckOffline extends Command
{
    protected $signature = 'gps:check-offline';

    protected $description = 'Raise an alert for each tracker that has stopped reporting (once per outage)';

    public function handle(): int
    {
        $minutes = config('tracking.offline_after_minutes');
        $raised  = 0;

        GpsDevice::with('vehicle:id,plate,driver_id,gps_lat,gps_lng')
            ->where('is_active', true)
            ->whereNotNull('vehicle_id')
            ->whereNotNull('last_ping')
            ->where('last_ping', '<', now()->subMinutes($minutes))
            ->get()
            ->each(function (GpsDevice $d) use ($minutes, &$raised) {
                // Cleared by GpsEventService as soon as the device reports again.
                if (! $d->vehicle || ! Cache::add("gps:offline:{$d->vehicle_id}", 1, now()->addDays(7))) {
                    return;
                }

                GpsEvent::create([
                    'vehicle_id'  => $d->vehicle_id,
                    'driver_id'   => $d->vehicle->driver_id,
                    'type'        => 'offline',
                    'severity'    => 'warning',
                    'message'     => "{$d->vehicle->plate} tracker has not reported for {$minutes}+ min (last: {$d->last_ping->diffForHumans()})",
                    'latitude'    => $d->vehicle->gps_lat,
                    'longitude'   => $d->vehicle->gps_lng,
                    'occurred_at' => now(),
                ]);
                $raised++;
            });

        $this->info("Offline alerts raised: {$raised}");

        return self::SUCCESS;
    }
}

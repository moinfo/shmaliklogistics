<?php

namespace App\Jobs;

use App\Models\Vehicle;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Turns a vehicle's GPS coordinates into a readable place, stored on the vehicle as:
 *   gps_road — the road it is on, e.g. "Morogoro Road" (shown as "via Morogoro Road")
 *   gps_area — "Ward, District, Region, Country" (the street itself is left out)
 *   gps_location_name — both joined, for the older Fleet pages
 *
 * Runs on the queue so a slow lookup can never stall the tracker listener.
 */
class ReverseGeocodeVehicle implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(
        public int $vehicleId,
        public float $lat,
        public float $lng,
    ) {}

    public function handle(): void
    {
        // Nominatim's usage policy allows at most one request per second.
        if (! Cache::add('nominatim:throttle', 1, 1)) {
            $this->release(2);
            return;
        }

        try {
            $res = Http::withHeaders(['User-Agent' => config('app.name', 'Laravel') . ' fleet tracking'])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format'          => 'jsonv2',
                    'lat'             => $this->lat,
                    'lon'             => $this->lng,
                    'zoom'            => 17,
                    'addressdetails'  => 1,
                    'accept-language' => 'en',
                ]);
        } catch (Throwable) {
            return;   // offline or blocked — the map still has the coordinates
        }

        if (! $res->successful()) {
            return;
        }

        [$road, $area] = self::describe($res->json('address') ?? [], $res->json('display_name'));
        if (! $road && ! $area) {
            return;
        }

        // Only write if the vehicle is still near the point we looked up (it may have driven on).
        Vehicle::whereKey($this->vehicleId)
            ->whereBetween('gps_lat', [$this->lat - 0.01, $this->lat + 0.01])
            ->whereBetween('gps_lng', [$this->lng - 0.01, $this->lng + 0.01])
            ->update([
                'gps_road'          => $road,
                'gps_area'          => $area,
                'gps_location_name' => mb_substr(trim(($road ? "via {$road}, " : '') . $area), 0, 200),
            ]);
    }

    /**
     * @param  array<string,string> $a Nominatim "address" block (field names differ between city and countryside)
     * @return array{0:?string,1:?string} [road, "Ward, District, Region, Country"]
     */
    public static function describe(array $a, ?string $fallback = null): array
    {
        $road = isset($a['road']) ? mb_substr($a['road'], 0, 120) : null;

        $ward     = $a['suburb'] ?? $a['neighbourhood'] ?? $a['quarter'] ?? $a['village'] ?? $a['hamlet'] ?? null;
        $district = $a['city_district'] ?? $a['state_district'] ?? $a['county'] ?? $a['municipality'] ?? null;
        // Dar es Salaam is both a city and a region and has no "state" entry; "Coastal Zone" is a zone, not a region.
        $region   = isset($a['state']) ? preg_replace('/\s+Region$/i', '', $a['state']) : ($a['city'] ?? $a['town'] ?? null);
        $country  = $a['country'] ?? null;

        // Drop repeats ("Chalinze, Chalinze, …").
        $parts = array_values(array_unique(array_filter([$ward, $district, $region, $country])));
        $area  = $parts ? mb_substr(implode(', ', $parts), 0, 200) : ($road ? null : ($fallback ? mb_substr($fallback, 0, 200) : null));

        return [$road, $area];
    }
}

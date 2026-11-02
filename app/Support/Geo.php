<?php

namespace App\Support;

/** Small geodesy helpers shared by tracking code. */
class Geo
{
    /** Great-circle distance in metres. */
    public static function distance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 2 * 6371000 * asin(min(1, sqrt($a)));
    }

    /** Initial compass bearing in degrees (0–359). */
    public static function bearing(float $lat1, float $lng1, float $lat2, float $lng2): int
    {
        $y = sin(deg2rad($lng2 - $lng1)) * cos(deg2rad($lat2));
        $x = cos(deg2rad($lat1)) * sin(deg2rad($lat2))
            - sin(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($lng2 - $lng1));

        return (int) fmod(rad2deg(atan2($y, $x)) + 360, 360);
    }

    public static function insideCircle(float $lat, float $lng, float $centerLat, float $centerLng, float $radiusM): bool
    {
        return self::distance($lat, $lng, $centerLat, $centerLng) <= $radiusM;
    }
}

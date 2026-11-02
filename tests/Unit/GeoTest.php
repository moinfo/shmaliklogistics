<?php

namespace Tests\Unit;

use App\Support\Geo;
use PHPUnit\Framework\TestCase;

class GeoTest extends TestCase
{
    public function test_distance_matches_known_values(): void
    {
        // One degree of latitude is ~111.2 km everywhere.
        $this->assertEqualsWithDelta(111195, Geo::distance(0, 0, 1, 0), 100);

        // Dar es Salaam port to Buza yard — roughly 9–10 km as the crow flies.
        $d = Geo::distance(-6.8184, 39.2965, -6.8667, 39.2167);
        $this->assertGreaterThan(9000, $d);
        $this->assertLessThan(11000, $d);

        $this->assertSame(0.0, Geo::distance(-6.8, 39.2, -6.8, 39.2));
    }

    public function test_bearing_points_the_right_way(): void
    {
        $this->assertSame(0, Geo::bearing(0, 0, 1, 0));      // north
        $this->assertSame(90, Geo::bearing(0, 0, 0, 1));     // east
        $this->assertSame(180, Geo::bearing(1, 0, 0, 0));    // south
        $this->assertSame(270, Geo::bearing(0, 1, 0, 0));    // west
    }

    public function test_inside_circle(): void
    {
        // 0.0009° of latitude is ~100 m.
        $this->assertTrue(Geo::insideCircle(-6.8009, 39.2, -6.8, 39.2, 250));
        $this->assertFalse(Geo::insideCircle(-6.8009, 39.2, -6.8, 39.2, 50));
        // Zone boundary behaves the same on the southern hemisphere.
        $this->assertFalse(Geo::insideCircle(-6.9, 39.2, -6.8, 39.2, 5000));
    }
}

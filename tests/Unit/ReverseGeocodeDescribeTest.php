<?php

namespace Tests\Unit;

use App\Jobs\ReverseGeocodeVehicle;
use PHPUnit\Framework\TestCase;

/** Address blocks below are real OpenStreetMap Nominatim answers for points on the Dar es Salaam – Morogoro road. */
class ReverseGeocodeDescribeTest extends TestCase
{
    public function test_city_address_gives_road_and_ward_district_region_country(): void
    {
        [$road, $area] = ReverseGeocodeVehicle::describe([
            'road' => 'Morogoro Road', 'suburb' => 'Msigani', 'city_district' => 'Ubungo Municipal',
            'city' => 'Dar es Salaam', 'region' => 'Coastal Zone', 'postcode' => '16112', 'country' => 'Tanzania',
        ]);

        $this->assertSame('Morogoro Road', $road);
        // Street-level detail (postcode) is dropped; "Coastal Zone" is a zone, not the region.
        $this->assertSame('Msigani, Ubungo Municipal, Dar es Salaam, Tanzania', $area);
    }

    public function test_countryside_address_uses_village_state_district_and_state(): void
    {
        [$road, $area] = ReverseGeocodeVehicle::describe([
            'village' => 'Viziwaziwa', 'state_district' => 'Kibaha Town', 'state' => 'Pwani Region',
            'region' => 'Coastal Zone', 'country' => 'Tanzania',
        ]);

        $this->assertNull($road);
        $this->assertSame('Viziwaziwa, Kibaha Town, Pwani, Tanzania', $area);
    }

    public function test_repeated_names_are_collapsed_and_missing_ward_is_skipped(): void
    {
        [, $area] = ReverseGeocodeVehicle::describe([
            'residential' => 'CHALINZE', 'town' => 'Chalinze', 'state_district' => 'Chalinze',
            'state' => 'Pwani Region', 'country' => 'Tanzania',
        ]);

        $this->assertSame('Chalinze, Pwani, Tanzania', $area);
    }

    public function test_town_with_road(): void
    {
        [$road, $area] = ReverseGeocodeVehicle::describe([
            'road' => 'Ujenzi Road', 'city' => 'Morogoro', 'state_district' => 'Morogoro Municipal',
            'state' => 'Morogoro Region', 'country' => 'Tanzania',
        ]);

        $this->assertSame('Ujenzi Road', $road);
        $this->assertSame('Morogoro Municipal, Morogoro, Tanzania', $area);
    }

    public function test_falls_back_to_the_full_name_when_there_is_no_address(): void
    {
        [$road, $area] = ReverseGeocodeVehicle::describe([], 'Somewhere, Tanzania');

        $this->assertNull($road);
        $this->assertSame('Somewhere, Tanzania', $area);
    }
}

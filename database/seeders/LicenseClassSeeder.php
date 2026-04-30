<?php

namespace Database\Seeders;

use App\Models\LicenseClass;
use Illuminate\Database\Seeder;

class LicenseClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['code' => 'B',  'name' => 'Light Vehicles',    'description' => 'Up to 3,500 kg',          'sort_order' => 1],
            ['code' => 'C1', 'name' => 'Medium Goods',       'description' => '3,500 – 7,500 kg',         'sort_order' => 2],
            ['code' => 'C',  'name' => 'Heavy Goods',        'description' => 'Over 7,500 kg',            'sort_order' => 3],
            ['code' => 'CE', 'name' => 'Articulated Trucks', 'description' => 'Class C + trailer',        'sort_order' => 4],
            ['code' => 'D1', 'name' => 'Minibus',            'description' => 'Up to 16 passengers',      'sort_order' => 5],
            ['code' => 'D',  'name' => 'Large Bus',          'description' => 'Over 8 passengers',        'sort_order' => 6],
            ['code' => 'DE', 'name' => 'Articulated Bus',    'description' => 'Class D + trailer',        'sort_order' => 7],
        ];

        foreach ($classes as $row) {
            LicenseClass::firstOrCreate(['code' => $row['code']], $row);
        }
    }
}

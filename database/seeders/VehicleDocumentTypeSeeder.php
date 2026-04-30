<?php

namespace Database\Seeders;

use App\Models\VehicleDocumentType;
use Illuminate\Database\Seeder;

class VehicleDocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $builtins = [
            ['name' => 'Insurance Expiry',            'description' => null, 'is_builtin' => true, 'sort_order' => 1],
            ['name' => 'Road Licence Expiry',          'description' => null, 'is_builtin' => true, 'sort_order' => 2],
            ['name' => 'Fitness Certificate Expiry',   'description' => null, 'is_builtin' => true, 'sort_order' => 3],
            ['name' => 'TRA Sticker Expiry',           'description' => null, 'is_builtin' => true, 'sort_order' => 4],
            ['name' => 'Goods Vehicle Licence Expiry', 'description' => null, 'is_builtin' => true, 'sort_order' => 5],
            ['name' => 'Next Service Date',            'description' => null, 'is_builtin' => true, 'sort_order' => 6],
        ];

        foreach ($builtins as $row) {
            VehicleDocumentType::firstOrCreate(
                ['name' => $row['name'], 'is_builtin' => true],
                $row
            );
        }
    }
}

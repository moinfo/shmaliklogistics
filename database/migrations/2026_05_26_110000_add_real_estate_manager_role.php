<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->updateOrInsert(
            ['slug' => 'real-estate-manager'],
            [
                'name'        => 'Real Estate Manager',
                'description' => 'Properties, units, tenants, leases, rent collection & property expenses',
                'permissions' => json_encode([
                    'realestate_properties.*',
                    'realestate_tenants.*',
                    'realestate_leases.*',
                    'realestate_rent.*',
                    'realestate_expenses.*',
                    'realestate_reports.*',
                ]),
                'is_active'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('roles')->where('slug', 'real-estate-manager')->delete();
    }
};
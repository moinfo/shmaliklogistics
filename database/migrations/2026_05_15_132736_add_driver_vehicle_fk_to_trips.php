<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->foreignId('driver_id')
                ->nullable()
                ->after('vehicle_plate')
                ->constrained('drivers')
                ->nullOnDelete();

            $table->foreignId('vehicle_id')
                ->nullable()
                ->after('driver_id')
                ->constrained('vehicles')
                ->nullOnDelete();
        });

        // Backfill: match driver_name → drivers.name, vehicle_plate → vehicles.plate
        DB::statement("
            UPDATE trips t
            INNER JOIN drivers d ON d.name = t.driver_name AND d.deleted_at IS NULL
            SET t.driver_id = d.id
            WHERE t.driver_id IS NULL
        ");

        DB::statement("
            UPDATE trips t
            INNER JOIN vehicles v ON v.plate = t.vehicle_plate AND v.deleted_at IS NULL
            SET t.vehicle_id = v.id
            WHERE t.vehicle_id IS NULL
        ");
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn(['driver_id', 'vehicle_id']);
        });
    }
};

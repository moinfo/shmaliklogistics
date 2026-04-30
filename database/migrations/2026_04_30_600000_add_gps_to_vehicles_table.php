<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->decimal('gps_lat', 10, 7)->nullable()->after('notes');
            $table->decimal('gps_lng', 10, 7)->nullable()->after('gps_lat');
            $table->timestamp('gps_last_seen')->nullable()->after('gps_lng');
            $table->string('gps_location_name', 200)->nullable()->after('gps_last_seen');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['gps_lat', 'gps_lng', 'gps_last_seen', 'gps_location_name']);
        });
    }
};

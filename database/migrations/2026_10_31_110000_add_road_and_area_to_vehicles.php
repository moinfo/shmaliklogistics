<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('gps_road', 120)->nullable()->after('gps_location_name');   // "Morogoro Road"
            $table->string('gps_area', 200)->nullable()->after('gps_road');            // "Ward, District, Region, Country"
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['gps_road', 'gps_area']);
        });
    }
};

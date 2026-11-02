<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_locations', function (Blueprint $table) {
            // Metres travelled since the previous record of the same device (0 for the first / outliers).
            $table->unsignedInteger('distance_m')->default(0)->after('altitude_m');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_locations', function (Blueprint $table) {
            $table->dropColumn('distance_m');
        });
    }
};

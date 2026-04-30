<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Identity numbers
            $table->string('chassis_number', 50)->nullable()->unique()->after('plate');
            $table->string('engine_number', 50)->nullable()->after('chassis_number');
            // Fuel
            $table->string('fuel_type', 20)->default('diesel')->after('payload_tons');
            $table->unsignedSmallInteger('fuel_tank_capacity_l')->nullable()->after('fuel_type');
            // Extra docs
            $table->date('tra_sticker_expiry')->nullable()->after('fitness_expiry');
            $table->date('goods_vehicle_licence_expiry')->nullable()->after('tra_sticker_expiry');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'chassis_number', 'engine_number',
                'fuel_type', 'fuel_tank_capacity_l',
                'tra_sticker_expiry', 'goods_vehicle_licence_expiry',
            ]);
        });
    }
};

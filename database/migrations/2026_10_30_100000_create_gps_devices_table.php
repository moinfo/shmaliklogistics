<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gps_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('imei', 20)->unique();
            $table->string('provider', 50)->default('teltonika');   // teltonika | concox | gt06
            $table->string('model', 50)->nullable();                // e.g. FMB130
            $table->string('sim_number', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_ping')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_devices');
    }
};

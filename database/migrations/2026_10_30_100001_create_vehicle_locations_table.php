<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gps_device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('speed_kmh', 5, 1)->nullable();
            $table->smallInteger('heading')->nullable();
            $table->smallInteger('altitude_m')->nullable();
            $table->unsignedTinyInteger('satellites')->nullable();
            $table->boolean('ignition')->nullable();
            $table->unsignedInteger('external_voltage_mv')->nullable();
            $table->json('io')->nullable();                         // raw IO elements (id => value)
            $table->timestamp('recorded_at');
            $table->timestamp('created_at')->nullable();

            // Devices re-send unacknowledged records, so a record is unique per device + time.
            $table->unique(['gps_device_id', 'recorded_at']);
            $table->index(['vehicle_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_locations');
    }
};

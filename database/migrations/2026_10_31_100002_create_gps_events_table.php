<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gps_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();   // driver at the time
            $table->foreignId('geofence_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40);            // see GpsEvent::TYPES
            $table->string('severity', 10)->default('warning');   // info | warning | critical
            $table->string('message', 255);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('value', 8, 1)->nullable();            // km/h for speeding, minutes for idle
            $table->timestamp('occurred_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index(['vehicle_id', 'occurred_at']);
            $table->index(['type', 'occurred_at']);
            $table->index('acknowledged_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_events');
    }
};

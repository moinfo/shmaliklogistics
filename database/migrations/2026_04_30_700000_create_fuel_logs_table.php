<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->nullOnDelete()->constrained();
            $table->foreignId('trip_id')->nullable()->nullOnDelete()->constrained();
            $table->date('log_date');
            $table->decimal('liters', 8, 2);
            $table->decimal('cost_per_liter', 8, 2);
            $table->decimal('total_cost', 10, 2)->virtualAs('liters * cost_per_liter');
            $table->unsignedInteger('odometer_km')->nullable();
            $table->string('station_name', 150)->nullable();
            $table->string('fuel_type', 20)->default('diesel');
            $table->string('currency', 10)->default('TZS');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->nullOnDelete()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};

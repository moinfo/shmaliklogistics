<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_number', 20)->unique();
            $table->string('status', 20)->default('planned');
            // Route
            $table->string('route_from');
            $table->string('route_to');
            $table->date('departure_date');
            $table->date('arrival_date')->nullable();
            // Assignment (plain text — replaced by FKs when Fleet module is built)
            $table->string('driver_name');
            $table->string('vehicle_plate');
            // Cargo
            $table->string('cargo_description')->nullable();
            $table->decimal('cargo_weight_tons', 8, 2)->nullable();
            // Financials (TZS)
            $table->decimal('freight_amount', 15, 2)->default(0);
            $table->decimal('fuel_cost', 15, 2)->default(0);
            $table->decimal('driver_allowance', 15, 2)->default(0);
            $table->decimal('border_costs', 15, 2)->default(0);
            $table->decimal('other_costs', 15, 2)->default(0);

            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};

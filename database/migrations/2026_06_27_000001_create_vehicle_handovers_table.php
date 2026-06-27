<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();

            // Header / trip info
            $table->string('driver_name')->nullable();
            $table->string('license_number', 60)->nullable();
            $table->string('license_class', 40)->nullable();
            $table->date('license_expiry')->nullable();
            $table->string('vehicle_registration', 30)->nullable();
            $table->string('horse_trailer', 60)->nullable();
            $table->unsignedInteger('odometer_km')->nullable();
            $table->string('fuel_level', 30)->nullable();
            $table->string('route_destination')->nullable();

            // Checklists — { key: { status: 'ok'|'fail'|'na', remarks: '...' } }
            $table->json('inspection')->nullable();
            $table->json('documentation')->nullable();

            // Declaration & signatures
            $table->string('handed_over_by')->nullable();
            $table->date('handed_over_date')->nullable();
            $table->string('received_by')->nullable();
            $table->date('received_date')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['vehicle_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_handovers');
    }
};

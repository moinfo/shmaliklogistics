<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate', 20)->unique();
            $table->string('status', 20)->default('active');
            // Identity
            $table->string('make', 60);
            $table->string('model_name', 60);
            $table->year('year');
            $table->string('type', 40);           // Flatbed, Container, Lowboy, Reefer…
            $table->string('color', 40)->nullable();
            // Specs
            $table->decimal('payload_tons', 8, 2)->nullable();
            $table->unsignedInteger('mileage_km')->default(0);
            // Documents
            $table->date('insurance_expiry')->nullable();
            $table->date('road_licence_expiry')->nullable();
            $table->date('fitness_expiry')->nullable();
            $table->date('next_service_date')->nullable();
            // Ownership
            $table->string('owner_name')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

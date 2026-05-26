<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('unit_number', 50);                         // "Main", "Room 1", "Apt A", "Shop 2"
            $table->string('type', 30)->default('room');              // room|self_contained|apartment|shop|office|hall|plot|whole_house
            $table->string('status', 20)->default('vacant');         // vacant|occupied|maintenance|reserved
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->decimal('size_sqm', 10, 2)->nullable();
            $table->decimal('rent_amount', 15, 2)->default(0);
            $table->char('rent_currency', 3)->default('TZS');
            $table->string('default_billing_cycle', 20)->default('monthly');
            $table->string('description', 200)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_units');
    }
};
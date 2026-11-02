<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geofences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('center_lat', 10, 7);
            $table->decimal('center_lng', 10, 7);
            $table->unsignedInteger('radius_m');
            $table->string('color', 9)->default('#3B82F6');
            $table->boolean('alert_on_enter')->default(true);
            $table->boolean('alert_on_exit')->default(true);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geofences');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_serials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('serial', 120);
            $table->string('status', 20)->default('in_stock'); // in_stock | issued
            $table->foreignId('received_movement_id')->nullable()->constrained('inventory_movements')->nullOnDelete();
            $table->foreignId('issued_movement_id')->nullable()->constrained('inventory_movements')->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['item_id', 'serial']);
            $table->index(['item_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_serials');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('cargo_number', 30)->unique();
            $table->foreignId('trip_id')->nullable()->constrained('trips')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('description', 500);
            $table->string('type', 50)->default('general'); // general/refrigerated/hazardous/bulk/oversized/perishable/livestock
            $table->decimal('weight_kg', 12, 2)->default(0);
            $table->decimal('volume_m3', 10, 3)->nullable();
            $table->unsignedInteger('pieces')->default(1);
            $table->string('packing_type', 50)->nullable(); // pallets/loose/crates/drums/bags/containers

            $table->string('origin', 200)->nullable();
            $table->string('destination', 200)->nullable();
            $table->string('consignee_name', 200)->nullable();
            $table->string('consignee_contact', 100)->nullable();

            $table->string('status', 30)->default('registered'); // registered/loaded/in_transit/at_border/cleared/delivered/cancelled
            $table->decimal('declared_value', 15, 2)->nullable();
            $table->string('currency', 10)->default('USD');

            $table->text('special_instructions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargos');
    }
};

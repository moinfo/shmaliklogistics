<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('portal_quote_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('route_from', 150);
            $table->string('route_to', 150);
            $table->string('cargo_description', 300);
            $table->decimal('cargo_weight_kg', 10, 2)->nullable();
            $table->integer('cargo_volume_m3')->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'quoted', 'cancelled'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('staff_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_quote_requests');
    }
};

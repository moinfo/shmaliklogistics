<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_expense_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->string('category', 30);
            $table->string('description', 200)->nullable();
            $table->decimal('quantity', 10, 3)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('amount', 15, 2);          // quantity × unit_price in source currency
            $table->char('currency', 3)->default('TZS');
            $table->decimal('exchange_rate', 10, 2)->nullable();
            $table->decimal('amount_tzs', 15, 2);      // always in TZS
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_expense_lines');
    }
};

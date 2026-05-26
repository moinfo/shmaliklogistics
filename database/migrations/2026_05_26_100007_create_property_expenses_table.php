<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('property_unit_id')->nullable()->constrained('property_units')->nullOnDelete();
            $table->string('category', 30);                            // renovation|repair|maintenance|utility|land_rent|tax|agent_fee|security|cleaning|furnishing|insurance|other
            $table->string('description', 200);
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('TZS');
            $table->decimal('exchange_rate', 10, 2)->nullable();
            $table->decimal('amount_tzs', 15, 2);
            $table->date('expense_date')->index();
            $table->string('phase', 20)->nullable();                   // acquisition|renovation|operating
            $table->string('vendor', 120)->nullable();
            $table->string('receipt_number', 60)->nullable();
            $table->string('receipt_path', 255)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_expenses');
    }
};
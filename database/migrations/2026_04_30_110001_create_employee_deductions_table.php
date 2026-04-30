<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deduction_type_id')->constrained('deduction_types')->cascadeOnDelete();
            $table->string('membership_number')->nullable();
            $table->decimal('fixed_amount', 14, 2)->nullable(); // for HESLB fixed monthly amount
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['employee_id', 'deduction_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_deductions');
    }
};

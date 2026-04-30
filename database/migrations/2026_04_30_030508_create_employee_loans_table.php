<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('loan_number', 20)->unique();
            $table->decimal('principal', 14, 2);           // original loan amount
            $table->decimal('balance_remaining', 14, 2);   // decreases each month
            $table->decimal('monthly_installment', 14, 2);
            $table->unsignedSmallInteger('total_months');
            $table->unsignedSmallInteger('months_paid')->default(0);
            $table->date('start_date');
            $table->date('expected_end_date')->nullable();
            $table->string('purpose')->nullable();
            $table->string('status', 20)->default('pending'); // pending, active, settled, defaulted
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('approval_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_loans');
    }
};

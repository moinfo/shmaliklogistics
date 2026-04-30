<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();

            // Earnings
            $table->decimal('basic_salary', 14, 2)->default(0);
            $table->decimal('allowances', 14, 2)->default(0);    // housing, transport, etc.
            $table->decimal('overtime', 14, 2)->default(0);
            $table->decimal('gross_salary', 14, 2)->default(0);  // = basic + allowances + overtime

            // Employee deductions
            $table->decimal('paye', 14, 2)->default(0);
            $table->decimal('nssf_employee', 14, 2)->default(0);
            $table->decimal('nhif_employee', 14, 2)->default(0);
            $table->decimal('other_deductions', 14, 2)->default(0);
            $table->decimal('total_deductions', 14, 2)->default(0);
            $table->decimal('net_salary', 14, 2)->default(0);

            // Employer costs
            $table->decimal('nssf_employer', 14, 2)->default(0);
            $table->decimal('sdl_employer', 14, 2)->default(0);
            $table->decimal('wcf_employer', 14, 2)->default(0);
            $table->decimal('total_employer_cost', 14, 2)->default(0); // gross + employer contributions

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_slips');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_slips', function (Blueprint $table) {
            $table->decimal('advance_deduction', 14, 2)->default(0)->after('other_deductions');
            $table->decimal('loan_deduction', 14, 2)->default(0)->after('advance_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_slips', function (Blueprint $table) {
            $table->dropColumn(['advance_deduction', 'loan_deduction']);
        });
    }
};

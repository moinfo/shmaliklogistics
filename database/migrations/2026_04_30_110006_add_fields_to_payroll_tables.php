<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add document_number and payroll_number to payroll_runs
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->string('document_number')->nullable()->after('id');
            $table->string('payroll_number')->nullable()->after('document_number');
        });

        // Add heslb, adjustment, loan_balance to payroll_slips
        Schema::table('payroll_slips', function (Blueprint $table) {
            $table->decimal('heslb', 14, 2)->default(0)->after('nhif_employee');
            $table->decimal('adjustment', 14, 2)->default(0)->after('other_deductions'); // positive = extra deduction, negative = increase net
            $table->decimal('loan_balance', 14, 2)->default(0)->after('loan_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropColumn(['document_number', 'payroll_number']);
        });
        Schema::table('payroll_slips', function (Blueprint $table) {
            $table->dropColumn(['heslb', 'adjustment', 'loan_balance']);
        });
    }
};

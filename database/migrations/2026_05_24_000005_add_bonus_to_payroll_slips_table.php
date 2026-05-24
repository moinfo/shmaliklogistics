<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_slips', function (Blueprint $table) {
            // Bonus is paid untaxed, so it is added to net_salary (not gross).
            // We store the components for transparency on the payslip:
            //   net bonus paid = max(0, bonus - bonus_penalty)
            $table->decimal('bonus', 14, 2)->default(0)->after('overtime');
            $table->decimal('bonus_penalty', 14, 2)->default(0)->after('bonus');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_slips', function (Blueprint $table) {
            $table->dropColumn(['bonus', 'bonus_penalty']);
        });
    }
};

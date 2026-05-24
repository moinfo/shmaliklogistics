<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The "makosa" log: a recorded event of an employee breaking a rule.
        // The penalty is snapshotted into `amount` so editing the rule later
        // never changes a past infraction.
        Schema::create('employee_infractions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bonus_rule_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2)->default(0);  // penalty applied (copied from rule, editable)
            $table->date('occurred_on');                   // determines which payroll month it hits
            $table->string('status', 20)->default('pending'); // pending | applied | waived
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('payroll_slip_id')->nullable()->constrained('payroll_slips')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_infractions');
    }
};

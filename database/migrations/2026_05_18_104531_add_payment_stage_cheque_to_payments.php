<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_stage', 20)->nullable()->after('payment_method'); // advance | final
            $table->string('cheque_number', 50)->nullable()->after('reference_number');
            $table->date('cheque_date')->nullable()->after('cheque_number');
            $table->decimal('usd_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('exchange_rate', 10, 2)->nullable()->after('usd_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_stage', 'cheque_number', 'cheque_date', 'usd_amount', 'exchange_rate']);
        });
    }
};

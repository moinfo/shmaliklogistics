<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('invoice_usd', 10, 2)->nullable()->after('freight_amount');
            $table->decimal('exchange_rate', 10, 2)->nullable()->after('invoice_usd');
            $table->decimal('invoice_tzs', 15, 2)->nullable()->after('exchange_rate');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['invoice_usd', 'exchange_rate', 'invoice_tzs']);
        });
    }
};

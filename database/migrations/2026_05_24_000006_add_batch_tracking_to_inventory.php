<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Batch / lot mode: stock stays a plain quantity, but a (non-unique)
        // lot number is recorded on each movement for traceability. Mutually
        // exclusive with per-unit serial tracking.
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->boolean('tracks_batch')->default(false)->after('tracks_serials');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->string('batch_number', 100)->nullable()->after('reference');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('tracks_batch');
        });
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('batch_number');
        });
    }
};

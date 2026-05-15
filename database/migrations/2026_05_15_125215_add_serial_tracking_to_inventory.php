<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->boolean('tracks_serials')->default(false)->after('unit');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->json('serials')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('tracks_serials');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('serials');
        });
    }
};

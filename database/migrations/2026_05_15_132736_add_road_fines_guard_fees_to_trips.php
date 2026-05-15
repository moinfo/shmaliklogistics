<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('road_fines', 15, 2)->default(0)->after('border_costs');
            $table->decimal('guard_fees', 15, 2)->default(0)->after('road_fines');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['road_fines', 'guard_fees']);
        });
    }
};

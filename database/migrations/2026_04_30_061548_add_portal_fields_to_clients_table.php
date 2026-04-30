<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('portal_password')->nullable()->after('notes');
            $table->boolean('portal_active')->default(false)->after('portal_password');
            $table->timestamp('last_portal_login')->nullable()->after('portal_active');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['portal_password', 'portal_active', 'last_portal_login']);
        });
    }
};

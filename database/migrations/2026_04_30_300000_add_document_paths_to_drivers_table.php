<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('license_doc_path')->nullable()->after('license_expiry');
            $table->string('visa_doc_path')->nullable()->after('license_doc_path');
            $table->date('visa_expiry')->nullable()->after('visa_doc_path');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['license_doc_path', 'visa_doc_path', 'visa_expiry']);
        });
    }
};

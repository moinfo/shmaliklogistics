<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();                          // TEN-YYYY-NNN
            $table->string('name', 120);
            $table->string('type', 20)->default('individual');        // individual|company
            $table->string('phone', 20);
            $table->string('phone_alt', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('national_id', 30)->nullable();
            $table->string('company_name', 150)->nullable();
            $table->string('tin', 30)->nullable();
            $table->string('address', 200)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('status', 20)->default('active');          // active|past
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
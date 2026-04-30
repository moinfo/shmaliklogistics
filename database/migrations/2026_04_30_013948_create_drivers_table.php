<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('status', 20)->default('active');
            // Contact
            $table->string('phone', 20);
            $table->string('phone_alt', 20)->nullable();
            $table->string('email', 100)->nullable();
            // Identity
            $table->string('national_id', 30)->nullable()->unique();
            $table->string('address')->nullable();
            // Licence
            $table->string('license_number', 40)->nullable()->unique();
            $table->string('license_class', 20)->nullable();  // B, C, CE, D…
            $table->date('license_expiry')->nullable();
            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();

            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};

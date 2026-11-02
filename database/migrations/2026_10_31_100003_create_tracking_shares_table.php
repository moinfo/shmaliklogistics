<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trip_id')->nullable()->constrained()->nullOnDelete();
            $table->string('token', 64)->unique();
            $table->string('label', 100)->nullable();     // who it was shared with
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_shares');
    }
};

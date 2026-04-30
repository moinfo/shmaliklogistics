<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('device_id')->nullable()->constrained('attendance_devices')->nullOnDelete();
            $table->timestamp('punch_time');
            $table->string('punch_type', 10)->default('in');  // in, out
            $table->string('source', 20)->default('device');  // device, manual, import
            $table->string('device_user_id')->nullable();     // ZKTeco user ID on device
            $table->string('verify_type', 20)->nullable();    // fingerprint, card, password, face
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'punch_time']);
            $table->index('punch_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};

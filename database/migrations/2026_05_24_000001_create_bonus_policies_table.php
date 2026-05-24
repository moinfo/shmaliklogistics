<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Default monthly bonus per department. An employee can override
        // this with their own employees.bonus value.
        Schema::create('bonus_policies', function (Blueprint $table) {
            $table->id();
            $table->string('department')->unique();        // e.g. Logistics, Operations
            $table->decimal('amount', 14, 2)->default(0);  // default monthly bonus (TZS)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bonus_policies');
    }
};

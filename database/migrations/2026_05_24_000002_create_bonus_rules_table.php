<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The "sheria" catalog: each rule is an offence with a default
        // penalty that is deducted from an employee's bonus when broken.
        Schema::create('bonus_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');                            // e.g. "Overspeeding"
            $table->decimal('penalty_amount', 14, 2)->default(0); // default deduction (TZS)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bonus_rules');
    }
};

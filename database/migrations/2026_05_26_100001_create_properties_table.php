<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();                          // PROP-YYYY-NNN
            $table->string('name', 150);
            $table->string('type', 30);                                // house|apartment|room_block|commercial|farm|land
            $table->string('status', 30)->default('available');       // available|occupied|partially_occupied|under_renovation|not_available
            $table->string('ownership', 20)->default('owned');        // owned|managed
            $table->string('address', 200)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->date('acquisition_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->char('purchase_currency', 3)->default('TZS');
            $table->decimal('market_value', 15, 2)->nullable();
            $table->string('title_deed_number', 80)->nullable();
            $table->string('title_deed_path', 255)->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
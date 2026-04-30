<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('period_from');
            $table->date('period_to');
            $table->unsignedSmallInteger('trips_count')->default(0);
            $table->decimal('on_time_pct', 5, 2)->nullable();
            $table->decimal('fuel_eff_kml', 6, 2)->nullable();
            $table->unsignedSmallInteger('incidents')->default(0);
            $table->unsignedTinyInteger('rating_punctuality')->nullable(); // 1-5
            $table->unsignedTinyInteger('rating_conduct')->nullable();
            $table->unsignedTinyInteger('rating_cargo_care')->nullable();
            $table->unsignedTinyInteger('rating_compliance')->nullable();
            $table->unsignedTinyInteger('manager_rating')->nullable();
            $table->text('manager_notes')->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('status', 20)->default('draft'); // draft, published
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appraisals');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_vacancies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('department', 100)->nullable();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->unsignedTinyInteger('openings')->default(1);
            $table->string('status', 20)->default('open'); // open, closed, filled
            $table->date('closing_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('job_vacancies')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('cv_path', 500)->nullable();
            $table->string('stage', 30)->default('applied'); // applied, shortlisted, interview, offer, hired, rejected
            $table->timestamp('interview_date')->nullable();
            $table->text('interview_notes')->nullable();
            $table->decimal('offer_amount', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_vacancies');
    }
};

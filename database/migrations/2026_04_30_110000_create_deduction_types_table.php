<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deduction_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');                        // PAYE, NSSF, etc.
            $table->string('nature', 20);                  // TAXABLE, GROSS, NET
            $table->string('abbreviation', 20);
            $table->text('description')->nullable();
            $table->string('registration_number')->nullable();
            $table->boolean('is_statutory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed Tanzania statutory deductions
        DB::table('deduction_types')->insert([
            ['name' => 'PAYE',  'nature' => 'TAXABLE', 'abbreviation' => 'PAYE',  'description' => 'Pay As You Earn',                      'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'NSSF',  'nature' => 'GROSS',   'abbreviation' => 'NSSF',  'description' => 'National Social Security Fund',         'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'WCF',   'nature' => 'GROSS',   'abbreviation' => 'WCF',   'description' => 'Workers Compensation',                  'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'HESLB', 'nature' => 'NET',     'abbreviation' => 'HESLB', 'description' => 'Higher Education Students Loans Board', 'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'SDL',   'nature' => 'GROSS',   'abbreviation' => 'SDL',   'description' => 'Skills & Development Levy',             'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'NHIF',  'nature' => 'NET',     'abbreviation' => 'NHIF',  'description' => 'National Health Insurance Fund',        'is_statutory' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('deduction_types');
    }
};

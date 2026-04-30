<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80)->unique();
            $table->text('value');           // JSON for complex values (bands), string for rates
            $table->string('label', 150)->nullable();
            $table->string('group', 60)->default('general');
            $table->timestamps();
        });

        // Seed default Tanzania statutory rates
        DB::table('payroll_settings')->insert([
            // PAYE brackets — array of [from, to|null, rate%]
            [
                'key'   => 'paye_bands',
                'value' => json_encode([
                    ['from' => 0,        'to' => 270000,   'rate' => 0],
                    ['from' => 270001,   'to' => 520000,   'rate' => 8],
                    ['from' => 520001,   'to' => 760000,   'rate' => 20],
                    ['from' => 760001,   'to' => 1000000,  'rate' => 25],
                    ['from' => 1000001,  'to' => null,     'rate' => 30],
                ]),
                'label' => 'PAYE Tax Bands (TZS/month)',
                'group' => 'paye',
                'created_at' => now(), 'updated_at' => now(),
            ],
            // SDL — 4.5% employer only
            ['key' => 'sdl_rate',         'value' => '4.5',  'label' => 'SDL Rate (%) — Employer Only',     'group' => 'sdl',  'created_at' => now(), 'updated_at' => now()],
            // NSSF — 10% employee + 10% employer
            ['key' => 'nssf_employee',    'value' => '10',   'label' => 'NSSF Employee Contribution (%)',    'group' => 'nssf', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'nssf_employer',    'value' => '10',   'label' => 'NSSF Employer Contribution (%)',    'group' => 'nssf', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'nssf_max_monthly', 'value' => '0',    'label' => 'NSSF Max Monthly Contribution (0 = no cap)', 'group' => 'nssf', 'created_at' => now(), 'updated_at' => now()],
            // NHIF — graduated bands
            [
                'key'   => 'nhif_bands',
                'value' => json_encode([
                    ['from' => 0,       'to' => 999999,  'amount' => 0],
                    ['from' => 1000000, 'to' => 1999999, 'amount' => 30000],
                    ['from' => 2000000, 'to' => 2999999, 'amount' => 60000],
                    ['from' => 3000000, 'to' => null,    'amount' => 90000],
                ]),
                'label' => 'NHIF Graduated Contribution (TZS/month)',
                'group' => 'nhif',
                'created_at' => now(), 'updated_at' => now(),
            ],
            // WCF (Workers Compensation Fund) — employer only
            ['key' => 'wcf_rate',         'value' => '0.5',  'label' => 'WCF Rate (%) — Employer Only',     'group' => 'wcf',  'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_settings');
    }
};

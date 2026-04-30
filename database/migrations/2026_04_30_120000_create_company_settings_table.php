<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('company_address')->nullable();
            $table->string('company_po_box')->nullable();
            $table->string('company_city')->nullable();
            $table->string('company_country')->default('Tanzania');
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_tin')->nullable();
            $table->string('company_logo')->nullable();   // path to uploaded logo
            $table->timestamps();
        });

        // Seed default — one row, always updated
        DB::table('company_settings')->insert([
            'company_name'    => 'YOUR COMPANY LIMITED',
            'company_address' => '',
            'company_po_box'  => '',
            'company_city'    => 'Dar es Salaam',
            'company_country' => 'Tanzania',
            'company_phone'   => '',
            'company_email'   => '',
            'company_tin'     => '',
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};

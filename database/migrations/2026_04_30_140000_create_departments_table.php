<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->nullable();
            $table->string('description', 300)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Seed defaults matching the existing string values used in employees
        $defaults = [
            ['Operations',      'OPS'],
            ['Finance',         'FIN'],
            ['Administration',  'ADM'],
            ['Logistics',       'LOG'],
            ['Mechanical',      'MEC'],
            ['Security',        'SEC'],
            ['Management',      'MGT'],
        ];
        foreach ($defaults as [$name, $code]) {
            DB::table('departments')->insert(['name' => $name, 'code' => $code, 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};

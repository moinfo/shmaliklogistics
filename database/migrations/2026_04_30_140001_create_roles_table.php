<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('description', 300)->nullable();
            $table->json('permissions')->nullable();  // array of "module.action" strings
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Seed common roles
        $roles = [
            ['name' => 'Administrator', 'slug' => 'administrator', 'description' => 'Full system access', 'permissions' => json_encode(['*'])],
            ['name' => 'Operations Manager', 'slug' => 'operations-manager', 'description' => 'Trips, fleet, drivers, permits, cargo', 'permissions' => json_encode(['trips.*', 'fleet.*', 'drivers.*', 'permits.*', 'cargo.*', 'reports.view'])],
            ['name' => 'Finance Officer', 'slug' => 'finance-officer', 'description' => 'Billing, expenses, payroll view', 'permissions' => json_encode(['billing.*', 'expenses.*', 'hr_payroll.view', 'reports.view'])],
            ['name' => 'HR Officer', 'slug' => 'hr-officer', 'description' => 'All HR modules', 'permissions' => json_encode(['hr_employees.*', 'hr_leave.*', 'hr_payroll.*', 'hr_advances.*', 'hr_loans.*', 'hr_attendance.*', 'hr_salary_slips.view'])],
            ['name' => 'Driver', 'slug' => 'driver', 'description' => 'View-only access to own trips', 'permissions' => json_encode(['trips.view'])],
        ];
        foreach ($roles as $role) {
            DB::table('roles')->insert(array_merge($role, ['is_active' => 1, 'created_at' => now(), 'updated_at' => now()]));
        }

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
        Schema::dropIfExists('roles');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rent_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();                // RNT-YYYY-NNNN
            $table->foreignId('lease_id')->constrained('leases')->cascadeOnDelete();
            $table->foreignId('property_unit_id')->nullable()->constrained('property_units')->nullOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->date('due_date')->index();
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('TZS');
            $table->string('status', 20)->default('unpaid')->index();  // unpaid|partial|paid|overdue|cancelled
            $table->string('notes', 200)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_invoices');
    }
};
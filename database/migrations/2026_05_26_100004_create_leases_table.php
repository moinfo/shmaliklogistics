<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->string('lease_number')->unique();                  // LSE-YYYY-NNNN
            $table->foreignId('property_unit_id')->constrained('property_units')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('billing_cycle', 20)->default('monthly');
            $table->decimal('rent_amount', 15, 2);
            $table->char('rent_currency', 3)->default('TZS');
            $table->decimal('deposit_amount', 15, 2)->default(0);
            $table->unsignedTinyInteger('payment_day')->nullable();    // day-of-month rent due (1-28)
            $table->string('status', 20)->default('active')->index();  // active|pending|expired|terminated
            $table->string('contract_path', 255)->nullable();          // uploaded mkataba (PDF/img)
            $table->timestamp('contract_uploaded_at')->nullable();
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rent_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rent_invoice_id')->constrained('rent_invoices')->cascadeOnDelete();
            $table->foreignId('lease_id')->nullable()->constrained('leases')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('TZS');
            $table->date('payment_date');
            $table->string('payment_method', 30)->default('cash');     // cash|bank_transfer|mobile_money|cheque
            $table->string('reference_number', 60)->nullable();
            $table->string('receipt_path', 255)->nullable();
            $table->string('notes', 200)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_payments');
    }
};
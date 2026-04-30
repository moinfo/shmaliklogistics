<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_documents', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20);          // quote | proforma | invoice
            $table->string('document_number', 30)->unique();
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('trip_id')->nullable()->constrained('trips')->nullOnDelete();
            $table->string('status', 30)->default('draft');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('currency', 10)->default('TZS');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(18); // Tanzania VAT 18%
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->foreignId('converted_from_id')->nullable()->constrained('billing_documents')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_documents');
    }
};

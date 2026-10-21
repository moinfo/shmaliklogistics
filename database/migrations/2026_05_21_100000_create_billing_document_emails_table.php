<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('billing_document_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_document_id')->constrained()->cascadeOnDelete();
            $table->string('recipient');
            $table->string('subject');
            $table->text('message')->nullable();
            $table->string('status', 16); // 'sent' | 'failed'
            $table->text('error')->nullable();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['billing_document_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_document_emails');
    }
};

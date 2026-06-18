<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guarantors', function (Blueprint $table) {
            $table->id();
            // Each guarantor belongs to one driver. NOTE: Driver uses SoftDeletes,
            // so the usual destroy() only sets deleted_at and this DB-level cascade
            // does NOT fire — guarantors stay attached and reappear if the driver is
            // restored. The cascade only triggers on a true forceDelete().
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();

            // Core details
            $table->string('name');
            $table->string('phone', 20);
            $table->string('address');

            // Single identity document: NIDA or voter's card
            $table->string('id_type', 20);          // nida | voters_card
            $table->string('id_number', 50);
            $table->string('id_doc_path')->nullable();      // scan/photo of the ID
            $table->string('letter_doc_path')->nullable();  // barua ya udhamini (guarantee letter)

            // House ownership — at least one of a driver's guarantors must own a house.
            $table->boolean('owns_house')->default(false);
            $table->string('house_address')->nullable();    // address of the house they built

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guarantors');
    }
};
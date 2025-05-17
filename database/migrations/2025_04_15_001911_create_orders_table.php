<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('catalog_id')->nullable()->constrained()->nullOnDelete();
            $table->string('client_name');
            $table->date('event_date');
            $table->string('venue');
            $table->integer('estimated_guests')->default(0);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->decimal('price', 12, 2);
            $table->enum('status', ['pending_payment', 'ongoing', 'completed', 'cancelled'])->default('pending_payment');
            $table->decimal('down_payment_amount', 12, 2)->nullable();
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->boolean('is_fully_paid')->default(false);
            $table->decimal('remaining_amount', 12, 2)->virtualAs('price - paid_amount');
            $table->decimal('discount_percent', 5, 2)->nullable();
            $table->decimal('discount_amount', 12, 2)->nullable();
            $table->string('discount_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

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
        Schema::table('payments', function (Blueprint $table) {
            // Add payment expiry time
            $table->timestamp('expiry_time')->nullable()->after('verified_at');

            // Add transaction details for Midtrans
            $table->string('transaction_id')->nullable()->after('note');
            $table->string('va_number')->nullable()->after('transaction_id');
            $table->string('bank_code')->nullable()->after('payment_method');

            // Add payment method type for better categorization
            $table->string('payment_method_type')->nullable()->after('bank_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('expiry_time');
            $table->dropColumn('transaction_id');
            $table->dropColumn('va_number');
            $table->dropColumn('bank_code');
            $table->dropColumn('payment_method_type');
        });
    }
};

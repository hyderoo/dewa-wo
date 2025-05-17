<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('legal_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['privacy_policy', 'terms_conditions']);
            $table->longText('content');
            $table->string('version')->default('1.0');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('legal_settings');
    }
};

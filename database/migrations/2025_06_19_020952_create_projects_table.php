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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('responsibility')->nullable();
            $table->date('start');
            $table->date('end');
            $table->tinyInteger('status')->nullable();
            $table->string('link')->nullable();
            $table->string('associate')->nullable();
            $table->string('image')->nullable();
            $table->string('tech')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

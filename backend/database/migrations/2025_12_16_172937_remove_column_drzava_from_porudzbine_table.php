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
        Schema::table('porudzbine', function (Blueprint $table) {
            $table->dropColumn('drzava');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('porudzbine', function (Blueprint $table) {
            $table->enum('drzava',['Srbija'])->default('Srbija')->after('prezime');
        });
    }
};

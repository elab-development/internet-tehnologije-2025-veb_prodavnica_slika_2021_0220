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
        Schema::table('stavke', function (Blueprint $table) {
            $table->unique(['porudzbina_id','rb']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stavke', function (Blueprint $table) {
            $table->dropUnique(['porudzbina_id','rb']);
        });
    }
};

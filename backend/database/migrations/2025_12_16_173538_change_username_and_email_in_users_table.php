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
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']); // uklonjen unique indeks
            $table->string('username', 30)->nullable(false)->change();
            $table->string('email', 30)->nullable(false)->change();
            $table->unique('email'); // ponovo dodat unique
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->string('username')->change();
            $table->string('email')->change();
            $table->unique('email');
        });

    }
};

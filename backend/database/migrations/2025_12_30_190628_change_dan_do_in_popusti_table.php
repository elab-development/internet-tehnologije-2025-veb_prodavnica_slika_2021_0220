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
        Schema::table('popusti', function (Blueprint $table) {

            $table->dropColumn('danDo');
            $table->tinyInteger('danDo')->unsigned()->after('mesecOd');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('popusti', function (Blueprint $table) {
            $table->dropColumn('danDo');
            $table->tinyInteger('danDo')->unsigned()->after('danOd');
        });
    }
};

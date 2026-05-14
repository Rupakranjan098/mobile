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
        Schema::table('expenses', function (Blueprint $table) {
            $table->decimal('taxable_amount', 15, 2)->nullable()->after('amount');
            $table->decimal('tax_amount', 15, 2)->nullable()->after('taxable_amount');
            $table->string('gstin')->nullable()->after('tax_amount');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['taxable_amount', 'tax_amount', 'gstin']);
        });
    }
};

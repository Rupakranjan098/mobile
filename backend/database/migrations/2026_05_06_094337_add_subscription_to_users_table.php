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
            $table->unsignedBigInteger('subscription_plan_id')->nullable()->after('password');
            $table->dateTime('subscription_expires_at')->nullable()->after('subscription_plan_id');
            
            $table->foreign('subscription_plan_id')->references('id')->on('subscription_plans')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['subscription_plan_id']);
            $table->dropColumn(['subscription_plan_id', 'subscription_expires_at']);
        });
    }
};

<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->string('category');
            $table->string('type')->default('Business');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('expenses'); }
};

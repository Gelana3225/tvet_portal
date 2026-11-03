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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id', 50)->unique();
            $table->foreignId('application_id')->unique()->constrained()->onDelete('restrict');
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('department_id')->constrained()->onDelete('restrict');
            $table->foreignId('occupation_id')->constrained()->onDelete('restrict');
            $table->foreignId('qualification_level_id')->constrained()->onDelete('restrict');
            $table->date('enrollment_date');
            $table->string('academic_year', 20);
            $table->enum('status', ['active', 'inactive', 'graduated', 'withdrawn'])->default('active');
            $table->foreignId('approved_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('approved_at');
            $table->timestamps();
            
            // Indexes
            $table->index('student_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number', 50)->unique();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('admission_period_id')->constrained()->onDelete('restrict');
            $table->foreignId('department_id')->constrained()->onDelete('restrict');
            $table->foreignId('occupation_id')->constrained()->onDelete('restrict');
            $table->foreignId('qualification_level_id')->constrained()->onDelete('restrict');
            $table->string('previous_school');
            $table->string('highest_education_level', 100);
            $table->year('completion_year');
            $table->text('certificate_info')->nullable();
            $table->enum('current_status', ['draft', 'submitted', 'under_review', 'correction_required', 'approved', 'rejected'])->default('draft');
            $table->boolean('declaration_accepted')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('correction_notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('application_number');
            $table->index('user_id');
            $table->index('admission_period_id');
            $table->index('current_status');
            $table->index('submitted_at');
            
            // Unique constraint: one application per user per admission period
            $table->unique(['user_id', 'admission_period_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

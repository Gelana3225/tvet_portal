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
        Schema::table('applications', function (Blueprint $table) {
            $table->string('previous_school_address')->nullable()->after('previous_school');
            $table->decimal('grade_10_result', 5, 2)->nullable()->after('previous_school_address');
            $table->decimal('grade_12_result', 5, 2)->nullable()->after('grade_10_result');
            $table->boolean('has_disability')->default(false)->after('grade_12_result');
            $table->text('disability_description')->nullable()->after('has_disability');
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('house_number', 50)->nullable()->after('kebele');
            $table->string('email', 255)->nullable()->after('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'previous_school_address',
                'grade_10_result',
                'grade_12_result',
                'has_disability',
                'disability_description',
            ]);
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'house_number',
                'email',
            ]);
        });
    }
};


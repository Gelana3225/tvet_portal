<?php

namespace Database\Seeders;

use App\Models\AdmissionPeriod;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdmissionPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user (create a simple one if needed for seeding)
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        
        $adminUser = \App\Models\User::firstOrCreate(
            ['email' => 'admin@hawagalan.edu.et'],
            [
                'password' => \Illuminate\Support\Facades\Hash::make('Admin@123'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        $periods = [
            [
                'name' => 'Fall 2026 Admission',
                'academic_year' => '2026/2027',
                'opening_date' => '2026-09-01',
                'closing_date' => '2026-11-30',
                'status' => 'open',
                'description' => 'Fall semester admission for academic year 2026/2027. Applications accepted from September 1 to November 30, 2026.',
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Spring 2027 Admission',
                'academic_year' => '2026/2027',
                'opening_date' => '2027-01-15',
                'closing_date' => '2027-03-31',
                'status' => 'draft',
                'description' => 'Spring semester admission for academic year 2026/2027. Applications will be accepted from January 15 to March 31, 2027.',
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($periods as $period) {
            AdmissionPeriod::create($period);
        }

        echo "Admission periods seeded successfully!\n";
    }
}

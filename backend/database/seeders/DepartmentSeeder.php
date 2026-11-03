<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Computer programming, networking, and IT support',
                'is_active' => true,
            ],
            [
                'name' => 'Construction',
                'code' => 'CONST',
                'description' => 'Building construction and related trades',
                'is_active' => true,
            ],
            [
                'name' => 'Automotive Technology',
                'code' => 'AUTO',
                'description' => 'Vehicle maintenance and repair',
                'is_active' => true,
            ],
            [
                'name' => 'Electrical Installation',
                'code' => 'ELEC',
                'description' => 'Electrical wiring and installation',
                'is_active' => true,
            ],
            [
                'name' => 'Plumbing',
                'code' => 'PLUMB',
                'description' => 'Water and drainage systems installation',
                'is_active' => true,
            ],
            [
                'name' => 'Agriculture',
                'code' => 'AGRI',
                'description' => 'Crop production and agricultural technologies',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }

        echo "Departments seeded successfully!\n";
    }
}

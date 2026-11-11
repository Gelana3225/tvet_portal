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
                'name' => 'Agricultural Technology',
                'code' => 'AGRI',
                'description' => 'Modern farming techniques, crop management, livestock husbandry, and sustainable agriculture.',
                'is_active' => true,
            ],
            [
                'name' => 'Manufacturing & Industrial Technology',
                'code' => 'MFG',
                'description' => 'Metal fabrication, welding, machine operations, woodwork, and modern furniture design.',
                'is_active' => true,
            ],
            [
                'name' => 'Information & Communication Technology',
                'code' => 'ICT',
                'description' => 'Fundamental IT skills, hardware maintenance, software systems, and network infrastructure.',
                'is_active' => true,
            ],
            [
                'name' => 'Construction & Building Technology',
                'code' => 'CONST',
                'description' => 'Building fundamentals, masonry, concrete work, civil structures, and site safety.',
                'is_active' => true,
            ],
            [
                'name' => 'Textile & Garment Technology',
                'code' => 'TEXTILE',
                'description' => 'Textile design, modern tailoring, industrial sewing, and apparel manufacturing.',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $data) {
            Department::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }

        echo "Hawa Gelan TVET College departments seeded successfully!\n";
    }
}

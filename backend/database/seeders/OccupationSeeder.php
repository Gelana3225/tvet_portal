<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Occupation;
use Illuminate\Database\Seeder;

class OccupationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $occupations = [
            // Agricultural Technology
            [
                'dept_code' => 'AGRI',
                'name' => 'Crop Production',
                'code' => 'AGRI-CROP',
                'description' => 'Agronomy, soil science, pest management, and maximizing crop yield. Level I - IV, Grade 12.',
            ],
            [
                'dept_code' => 'AGRI',
                'name' => 'Animal Production',
                'code' => 'AGRI-ANIM',
                'description' => 'Livestock management, animal health, breeding, and sustainable animal farming. Level I - IV, Grade 12.',
            ],
            [
                'dept_code' => 'AGRI',
                'name' => 'General Agriculture',
                'code' => 'AGRI-GEN',
                'description' => 'Modern farming techniques, crop management, and sustainable agriculture. Level I - IV, Grade 12.',
            ],

            // Manufacturing & Industrial Technology
            [
                'dept_code' => 'MFG',
                'name' => 'General Metal Fabrication and Assembly',
                'code' => 'MFG-GMFA',
                'description' => 'Welding, sheet metal work, structural metal fabrication, and machine operations. Level I - IV, Grade 12.',
            ],
            [
                'dept_code' => 'MFG',
                'name' => 'Wood Work Technology',
                'code' => 'MFG-WWT',
                'description' => 'Design, fabrication, and finishing of modern and traditional furniture. Level I - IV, Grade 12.',
            ],

            // Information & Communication Technology
            [
                'dept_code' => 'ICT',
                'name' => 'Hardware and Networking Service (HNS)',
                'code' => 'ICT-HNS',
                'description' => 'Fundamental IT skills, software and hardware maintenance, network infrastructure. Level I - IV, Grade 12.',
            ],

            // Construction & Building Technology
            [
                'dept_code' => 'CONST',
                'name' => 'Structural Construction Work (SCW)',
                'code' => 'CONST-SCW',
                'description' => 'Building fundamentals, masonry, concrete work, and site safety. Level I - IV, Grade 12.',
            ],

            // Textile & Garment Technology
            [
                'dept_code' => 'TEXTILE',
                'name' => 'Garment',
                'code' => 'TEX-GARM',
                'description' => 'Textile design, tailoring, apparel manufacturing, and quality control. Level I - IV, Grade 12.',
            ],
        ];

        foreach ($occupations as $occ) {
            $dept = Department::where('code', $occ['dept_code'])->first();
            if ($dept) {
                Occupation::updateOrCreate(
                    ['code' => $occ['code']],
                    [
                        'department_id' => $dept->id,
                        'name' => $occ['name'],
                        'description' => $occ['description'],
                        'is_active' => true,
                    ]
                );
            }
        }

        echo "Hawa Gelan TVET College occupations seeded successfully!\n";
    }
}

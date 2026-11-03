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
            // IT Department
            ['dept_code' => 'IT', 'name' => 'Software Development', 'code' => 'IT-SD', 'description' => 'Programming and software development Level III'],
            ['dept_code' => 'IT', 'name' => 'Network Administration', 'code' => 'IT-NA', 'description' => 'Computer networking Level III'],
            ['dept_code' => 'IT', 'name' => 'Database Administration', 'code' => 'IT-DBA', 'description' => 'Database management Level III'],
            
            // Construction Department
            ['dept_code' => 'CONST', 'name' => 'Building Construction', 'code' => 'CONST-BC', 'description' => 'Building and construction Level III'],
            ['dept_code' => 'CONST', 'name' => 'Masonry', 'code' => 'CONST-MAS', 'description' => 'Brick and stone masonry Level III'],
            ['dept_code' => 'CONST', 'name' => 'Carpentry', 'code' => 'CONST-CARP', 'description' => 'Wood construction and finishing Level III'],
            
            // Automotive Department
            ['dept_code' => 'AUTO', 'name' => 'Auto Mechanics', 'code' => 'AUTO-MECH', 'description' => 'Vehicle maintenance and repair Level III'],
            ['dept_code' => 'AUTO', 'name' => 'Auto Body Repair', 'code' => 'AUTO-BODY', 'description' => 'Vehicle body repair and painting Level III'],
            
            // Electrical Department
            ['dept_code' => 'ELEC', 'name' => 'Electrical Installation', 'code' => 'ELEC-INST', 'description' => 'Residential and commercial electrical installation Level III'],
            ['dept_code' => 'ELEC', 'name' => 'Industrial Electrical', 'code' => 'ELEC-IND', 'description' => 'Industrial electrical systems Level III'],
            
            // Plumbing Department
            ['dept_code' => 'PLUMB', 'name' => 'Plumbing Installation', 'code' => 'PLUMB-INST', 'description' => 'Water and drainage systems Level III'],
            
            // Agriculture Department
            ['dept_code' => 'AGRI', 'name' => 'Crop Production', 'code' => 'AGRI-CROP', 'description' => 'Modern crop production techniques Level III'],
            ['dept_code' => 'AGRI', 'name' => 'Animal Husbandry', 'code' => 'AGRI-ANIM', 'description' => 'Livestock management Level III'],
        ];

        foreach ($occupations as $occupationData) {
            $department = Department::where('code', $occupationData['dept_code'])->first();
            
            if ($department) {
                Occupation::create([
                    'department_id' => $department->id,
                    'name' => $occupationData['name'],
                    'code' => $occupationData['code'],
                    'description' => $occupationData['description'],
                    'is_active' => true,
                ]);
            }
        }

        echo "Occupations seeded successfully!\n";
    }
}

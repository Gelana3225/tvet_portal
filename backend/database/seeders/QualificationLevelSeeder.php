<?php

namespace Database\Seeders;

use App\Models\QualificationLevel;
use Illuminate\Database\Seeder;

class QualificationLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'name' => 'Level I',
                'code' => 'L1',
                'description' => 'TVET Level I qualification',
                'is_active' => true,
            ],
            [
                'name' => 'Level II',
                'code' => 'L2',
                'description' => 'TVET Level II qualification',
                'is_active' => true,
            ],
            [
                'name' => 'Level III',
                'code' => 'L3',
                'description' => 'TVET Level III qualification',
                'is_active' => true,
            ],
            [
                'name' => 'Level IV',
                'code' => 'L4',
                'description' => 'TVET Level IV qualification',
                'is_active' => true,
            ],
        ];

        foreach ($levels as $level) {
            QualificationLevel::updateOrCreate(
                ['code' => $level['code']],
                $level
            );
        }

        $this->command->info('Qualification levels seeded successfully!');
    }
}

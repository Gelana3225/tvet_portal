<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Get admin role id
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        if (!$adminRole) {
            $this->command->error('Admin role not found. Run RoleSeeder first.');
            return;
        }

        // Check if admin already exists
        $exists = DB::table('users')->where('email', 'admin@hawagalan.edu.et')->first();
        if ($exists) {
            // Update password just in case
            DB::table('users')->where('email', 'admin@hawagalan.edu.et')->update([
                'password'  => Hash::make('Admin@123'),
                'is_active' => true,
                'role_id'   => $adminRole->id,
            ]);
            $this->command->info('Admin user updated: admin@hawagalan.edu.et / Admin@123');
            return;
        }

        DB::table('users')->insert([
            'email'      => 'admin@hawagalan.edu.et',
            'password'   => Hash::make('Admin@123'),
            'role_id'    => $adminRole->id,
            'is_active'  => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Admin user created: admin@hawagalan.edu.et / Admin@123');
    }
}


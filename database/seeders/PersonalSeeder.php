<?php

namespace Database\Seeders;

use App\Models\Personal;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PersonalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $personals = [
            [
                'desc' => '',
                'role' => '',
                'about' => '',
                'photo' => '',
            ],

        ];
        foreach ($personals as $personal) {
            Personal::create($personal);
        }
    }
}

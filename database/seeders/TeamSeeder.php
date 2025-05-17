<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            [
                'name' => 'Amanda Putri',
                'role' => 'Founder & Wedding Planner',
                'image' => '/tim.jpg',
                'description' => 'Profesional berpengalaman dengan visi transformatif dalam industri wedding organizer, memimpin tim dengan strategi inovatif dan dedikasi tinggi.',
                'instagram' => 'https://instagram.com/amandaputri',
                'linkedin' => 'https://linkedin.com/in/amandaputri',
                'is_highlighted' => true,
            ],
            [
                'name' => 'Rizky Hernawan',
                'role' => 'Senior Wedding Coordinator',
                'image' => '/tim.jpg',
                'description' => 'Ahli koordinasi dengan ketelitian premium, mengoptimalkan setiap detail acara untuk pengalaman pernikahan yang sempurna dan tak terlupakan.',
                'instagram' => 'https://instagram.com/rizkyhernawan',
                'linkedin' => 'https://linkedin.com/in/rizkyhernawan',
                'is_highlighted' => false,
            ],
            [
                'name' => 'Siti Rahmawati',
                'role' => 'Creative Director',
                'image' => '/tim.jpg',
                'description' => 'Visioner desain dengan kemampuan mentransformasi konsep abstrak menjadi realitas visual yang memukau, menciptakan tema pernikahan yang unik dan personal.',
                'instagram' => 'https://instagram.com/sitirahmawati',
                'linkedin' => 'https://linkedin.com/in/sitirahmawati',
                'is_highlighted' => false,
            ],
        ];

        foreach ($teams as $team) {
            Team::create($team);
        }
    }
}

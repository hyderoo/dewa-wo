<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Premium Features
        $premiumServices = [
            [
                'title' => 'Royal Wedding Experience',
                'description' => 'Rasakan atmosfer pernikahan mewah dengan dekorasi dan pelayanan setara kerajaan',
                'icon' => 'Crown',
                'type' => 'premium',
            ],
            [
                'title' => 'Cinema Style Documentation',
                'description' => 'Tim dokumentasi profesional dengan peralatan terkini untuk mengabadikan momen berharga',
                'icon' => 'Camera',
                'type' => 'premium',
            ],
            [
                'title' => 'Premium Entertainment',
                'description' => 'Pilihan entertainment berkelas untuk memeriahkan acara pernikahan Anda',
                'icon' => 'Music',
                'type' => 'premium',
            ],
            [
                'title' => 'Custom Decoration',
                'description' => 'Dekorasi yang dipersonalisasi sesuai tema dan keinginan Anda',
                'icon' => 'Palette',
                'type' => 'premium',
            ],
        ];

        foreach ($premiumServices as $service) {
            Service::create($service);
        }

        // Additional Services
        $additionalServices = [
            [
                'title' => 'Honeymoon Planning',
                'description' => 'Perencanaan bulan madu ke destinasi impian Anda',
                'icon' => 'MapPin',
                'type' => 'additional',
                'features' => [
                    'Pemilihan destinasi eksklusif',
                    'Akomodasi mewah',
                    'Itinerary khusus',
                    'Concierge service',
                ],
            ],
            [
                'title' => 'Pre-Wedding Services',
                'description' => 'Layanan lengkap untuk sesi foto pre-wedding',
                'icon' => 'Camera',
                'type' => 'additional',
                'features' => [
                    'Lokasi eksotis',
                    'Makeup artist profesional',
                    'Fashion stylist',
                    'Konsep kreatif',
                ],
            ],
        ];

        foreach ($additionalServices as $service) {
            Service::create($service);
        }

        // Exclusive Benefits
        $exclusiveServices = [
            [
                'title' => 'Personal Touch',
                'description' => 'Pendekatan personal untuk memahami setiap detail keinginan Anda',
                'icon' => 'Heart',
                'type' => 'exclusive',
            ],
            [
                'title' => 'Dedicated Team',
                'description' => 'Tim khusus yang akan mendampingi persiapan hingga hari H',
                'icon' => 'Users',
                'type' => 'exclusive',
            ],
            [
                'title' => 'Special Gifts',
                'description' => 'Bonus spesial untuk setiap paket premium yang dipilih',
                'icon' => 'Gift',
                'type' => 'exclusive',
            ],
        ];

        foreach ($exclusiveServices as $service) {
            Service::create($service);
        }
    }
}

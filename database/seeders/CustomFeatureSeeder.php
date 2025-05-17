<?php

namespace Database\Seeders;

use App\Models\CustomFeature;
use Illuminate\Database\Seeder;

class CustomFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'name' => 'Dekorasi Premium',
                'price' => 15000000,
                'description' => 'Dekorasi mewah dengan bunga segar dan lighting khusus untuk venue pernikahan.',
            ],
            [
                'name' => 'Catering 500 Porsi',
                'price' => 75000000,
                'description' => 'Paket catering premium dengan 8 menu utama, 3 dessert, dan 2 minuman untuk 500 tamu.',
            ],
            [
                'name' => 'Live Music Performance',
                'price' => 25000000,
                'description' => 'Penampilan musik live dengan band profesional selama 3 jam untuk memeriahkan acara.',
            ],
            [
                'name' => 'Photo & Video Premium',
                'price' => 30000000,
                'description' => 'Layanan foto dan video premium dengan tim profesional, termasuk drone shots dan same-day edit.',
            ],
            [
                'name' => 'Bridal Makeup & Attire',
                'price' => 12000000,
                'description' => 'Paket makeup dan gaun pengantin premium dari desainer ternama.',
            ],
            [
                'name' => 'Wedding Car Rental',
                'price' => 5000000,
                'description' => 'Sewa mobil pengantin mewah termasuk dekorasi dan sopir untuk 12 jam.',
            ],
            [
                'name' => 'Souvenir Package (100 pcs)',
                'price' => 7500000,
                'description' => 'Paket souvenir premium customized untuk 100 tamu undangan.',
            ],
            [
                'name' => 'Wedding Cake',
                'price' => 3500000,
                'description' => 'Kue pengantin multi-tier dengan design custom dari pastry chef ternama.',
            ],
            [
                'name' => 'MC Professional',
                'price' => 8000000,
                'description' => 'Master of Ceremony profesional berpengalaman untuk memandu acara pernikahan Anda.',
            ],
            [
                'name' => 'Lighting & Special Effects',
                'price' => 10000000,
                'description' => 'Setting lighting profesional dengan special effects untuk menciptakan suasana magis.',
            ],
            [
                'name' => 'Photobooth Interactive',
                'price' => 5000000,
                'description' => 'Photobooth interaktif dengan props dan cetak instan untuk tamu undangan.',
            ],
            [
                'name' => 'Venue Decoration Extension',
                'price' => 20000000,
                'description' => 'Perpanjangan dekorasi venue untuk area outdoor dan indoor tambahan.',
            ]
        ];

        foreach ($features as $feature) {
            CustomFeature::create($feature);
        }
    }
}

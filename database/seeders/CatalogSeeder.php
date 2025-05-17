<?php

namespace Database\Seeders;

use App\Models\Catalog;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalogs = [
            [
                'name' => 'Paket Pernikahan Lengkap',
                'description' => 'Paket komprehensif yang mencakup semua aspek perencanaan dan pelaksanaan pernikahan dari awal hingga akhir.',
                'price' => [50000000, 100000000], // [minPrice, maxPrice]
                'type' => 'all-in-one',
                'features' => [
                    'Konsultasi desain dan tema',
                    'Manajemen vendor',
                    'Dekorasi lengkap',
                    'Dokumentasi profesional',
                    'Koordinasi hari H',
                    'Catering untuk 500 tamu',
                    'Entertainment & sound system'
                ],
                'image' => '/pernikahan.jpg',
            ],
            [
                'name' => 'Paket Dekorasi Premium',
                'description' => 'Dekorasi pelaminan, photobooth, dan area tamu dengan konsep premium yang disesuaikan dengan tema pernikahan.',
                'price' => [25000000, 45000000], // [minPrice, maxPrice]
                'type' => 'decoration',
                'features' => [
                    'Konsultasi desain',
                    'Pelaminan premium',
                    'Dekorasi area tamu',
                    'Photobooth kustom',
                    'Bunga segar',
                    'Lighting setup',
                    'Furniture khusus'
                ],
                'image' => '/pernikahan.jpg',
            ],
            [
                'name' => 'Paket Dokumentasi Elite',
                'description' => 'Layanan dokumentasi lengkap untuk mengabadikan momen berharga dalam pernikahan Anda dengan kualitas terbaik.',
                'price' => [15000000, 35000000], // [minPrice, maxPrice]
                'type' => 'documentation',
                'features' => [
                    'Pre-wedding photoshoot',
                    'Cinematic wedding film',
                    'Drone aerial shots',
                    'Tim fotografer profesional',
                    'Album foto premium',
                    'Same-day edit video',
                    'USB dalam box custom'
                ],
                'image' => '/pernikahan.jpg',
            ],
            [
                'name' => 'Intimate Wedding Package',
                'description' => 'Paket pernikahan intim untuk 50-100 tamu dengan fokus pada detail dan pengalaman personal.',
                'price' => [35000000, 60000000], // [minPrice, maxPrice]
                'type' => 'all-in-one',
                'features' => [
                    'Venue eksklusif',
                    'Catering premium',
                    'Dekorasi minimalis elegan',
                    'Dokumentasi lengkap',
                    'Wedding cake',
                    'Bridal makeup & attire',
                    'Koordinasi acara'
                ],
                'image' => '/pernikahan.jpg',
            ],
            [
                'name' => 'Paket Dekorasi Rustic',
                'description' => 'Dekorasi bergaya rustic dengan sentuhan alam dan kayu untuk menciptakan suasana hangat dan natural.',
                'price' => [18000000, 30000000], // [minPrice, maxPrice]
                'type' => 'decoration',
                'features' => [
                    'Desain dengan elemen kayu',
                    'Aksen bunga liar & daun',
                    'Lighting ambient',
                    'Photobooth rustic',
                    'Pelaminan konsep outdoor',
                    'Signage custom',
                    'Area tamu bergaya picnic'
                ],
                'image' => '/pernikahan.jpg',
            ],
            [
                'name' => 'Video Highlight Package',
                'description' => 'Paket video highlight profesional untuk mengabadikan momen-momen terpenting dalam format cinematic.',
                'price' => [10000000, 20000000], // [minPrice, maxPrice]
                'type' => 'documentation',
                'features' => [
                    'Video highlight 5-10 menit',
                    'Cinematic color grading',
                    'Licensed background music',
                    'Interview with close family',
                    'Aerial footage',
                    'Same-day edit preview',
                    'Digital delivery'
                ],
                'image' => '/pernikahan.jpg',
            ]
        ];

        foreach ($catalogs as $catalog) {
            Catalog::create($catalog);
        }
    }
}

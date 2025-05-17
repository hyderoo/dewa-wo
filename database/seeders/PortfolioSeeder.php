<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\PortfolioImage;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $portfolios = [
            [
                'title' => 'Pernikahan Adat Jawa Elegan',
                'category' => 'Pernikahan Adat',
                'description' => 'Upacara sakral dengan nuansa tradisional yang memukau. Perpaduan tradisi Jawa yang kental dengan sentuhan modern yang elegan. Menghadirkan pengalaman pernikahan yang mengakar pada budaya namun tetap relevan dengan zaman.',
                'images' => [
                    '/nikah.jpg',
                    '/nikah-jawa-1.jpg',
                    '/nikah-jawa-2.jpg',
                ],
            ],
            [
                'title' => 'Wedding Garden Party',
                'category' => 'Pernikahan Modern',
                'description' => 'Perayaan pernikahan outdoor dengan konsep garden party yang indah. Diselenggarakan di taman yang rindang dengan dekorasi bunga segar dan lampu-lampu gantung yang memberikan suasana romantis di bawah langit terbuka.',
                'images' => [
                    '/wedding-garden.jpg',
                    '/garden-party-1.jpg',
                    '/garden-party-2.jpg',
                ],
            ],
            [
                'title' => 'Intimate Wedding di Bali',
                'category' => 'Intimate Wedding',
                'description' => 'Pernikahan intim dengan 50 tamu di tepi pantai Bali. Upacara yang sederhana namun penuh makna dengan pemandangan sunset yang memukau, menciptakan momen tak terlupakan bagi pasangan dan para tamu undangan.',
                'images' => [
                    '/bali-wedding.jpg',
                    '/bali-sunset-1.jpg',
                    '/bali-beach-ceremony.jpg',
                ],
            ],
            [
                'title' => 'Royal Wedding Package',
                'category' => 'Pernikahan Modern',
                'description' => 'Konsep pernikahan mewah dengan dekorasi yang megah dan pelayanan VIP. Mengusung tema kerajaan dengan detail ornamen emas dan perak, serta layanan butler untuk tamu VIP, memberikan pengalaman pernikahan bak seorang bangsawan.',
                'images' => [
                    '/royal-wedding.jpg',
                    '/royal-decoration.jpg',
                    '/royal-reception.jpg',
                ],
            ],
            [
                'title' => 'Pernikahan Adat Minang',
                'category' => 'Pernikahan Adat',
                'description' => 'Perpaduan tradisi Minangkabau yang kaya dengan sentuhan modern yang elegan. Menghadirkan prosesi adat Minang lengkap termasuk maminang, mahanta siriah, dan manjapuik marapulai dengan pakaian adat yang memukau.',
                'images' => [
                    '/minang-wedding.jpg',
                    '/minang-ceremony.jpg',
                    '/minang-couple.jpg',
                ],
            ],
            [
                'title' => 'Destination Wedding di Labuan Bajo',
                'category' => 'Destination Wedding',
                'description' => 'Pernikahan eksotis di Labuan Bajo dengan pemandangan laut dan pulau-pulau kecil. Upacara dilaksanakan di kapal pinisi yang berlayar melintasi perairan Labuan Bajo, dengan sunset cruise dan dinner di atas laut.',
                'images' => [
                    '/labuan-bajo-wedding.jpg',
                    '/pinisi-boat-ceremony.jpg',
                    '/komodo-island-photoshoot.jpg',
                ],
            ],
        ];

        foreach ($portfolios as $portfolioData) {
            // Get images array before creating portfolio
            $images = $portfolioData['images'];
            unset($portfolioData['images']);

            // Set the first image as the main portfolio image for backward compatibility
            $portfolioData['image'] = $images[0];

            // Create the portfolio
            $portfolio = Portfolio::create($portfolioData);

            // Create portfolio images
            foreach ($images as $index => $imagePath) {
                PortfolioImage::create([
                    'portfolio_id' => $portfolio->id,
                    'image_path' => $imagePath,
                    'display_order' => $index + 1
                ]);
            }
        }
    }
}

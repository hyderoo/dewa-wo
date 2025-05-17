<?php

namespace Database\Seeders;

use App\Models\LegalSetting;
use Illuminate\Database\Seeder;

class LegalSettingSeeder extends Seeder
{
    public function run()
    {
        $privacyPolicy = <<<'HTML'
<div class="legal-content">
    <h1 class="text-2xl font-bold mb-4">Kebijakan Privasi</h1>

    <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">1. Pengumpulan Informasi</h2>
        <p class="mb-2">Kami mengumpulkan informasi berikut:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Nama dan informasi kontak</li>
            <li>Data transaksi</li>
            <li>Informasi penggunaan website</li>
        </ul>
    </section>

    <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">2. Penggunaan Data</h2>
        <p>Data digunakan untuk:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Memproses pesanan</li>
            <li>Meningkatkan layanan</li>
            <li>Komunikasi pemasaran</li>
        </ul>
    </section>

    <section>
        <h2 class="text-xl font-semibold mb-2">3. Perlindungan Data</h2>
        <p>Kami menggunakan enkripsi SSL dan protokol keamanan lainnya untuk melindungi data Anda.</p>
    </section>
</div>
HTML;

        $termsConditions = <<<'HTML'
<div class="legal-content">
    <h1 class="text-2xl font-bold mb-4">Syarat dan Ketentuan</h1>

    <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">1. Penggunaan Layanan</h2>
        <p>Dengan menggunakan layanan kami, Anda setuju untuk:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Menyediakan informasi yang akurat</li>
            <li>Mematuhi semua hukum yang berlaku</li>
            <li>Tidak menyalahgunakan sistem</li>
        </ul>
    </section>

    <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">2. Pembayaran</h2>
        <p>Ketentuan pembayaran:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Pembayaran harus lunas sebelum pekerjaan dimulai</li>
            <li>Pembatalan dikenakan biaya 10%</li>
        </ul>
    </section>

    <section>
        <h2 class="text-xl font-semibold mb-2">3. Hak Cipta</h2>
        <p>Semua konten di website ini dilindungi hak cipta.</p>
    </section>
</div>
HTML;

        LegalSetting::create([
            'type' => 'privacy_policy',
            'content' => $privacyPolicy,
            'version' => '1.0'
        ]);

        LegalSetting::create([
            'type' => 'terms_conditions',
            'content' => $termsConditions,
            'version' => '1.0'
        ]);
    }
}

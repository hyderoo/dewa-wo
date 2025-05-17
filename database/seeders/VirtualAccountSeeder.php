<?php

namespace Database\Seeders;

use App\Models\VirtualAccount;
use App\Helpers\BankLogoDownloader;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class VirtualAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Make sure the storage directory exists
        $storagePath = storage_path('app/public/va_logos');
        if (!File::exists($storagePath)) {
            File::makeDirectory($storagePath, 0755, true);
        }

        // Download bank logos
        $this->command->info('Downloading bank logos...');
        $logoPaths = BankLogoDownloader::downloadBankLogos();

        // Sample virtual accounts with payment instructions
        $virtualAccounts = [
            [
                'bank_code' => 'bca',
                'name' => 'BCA Virtual Account',
                'is_active' => true,
                'description' => 'Bank Central Asia Virtual Account for payments',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke Mobile Banking BCA',
                        'instruction' => 'Buka aplikasi BCA Mobile Banking dan login menggunakan akun Anda.'
                    ],
                    [
                        'step' => 'Pilih Menu Transfer',
                        'instruction' => 'Pada halaman utama, pilih menu "Transfer".'
                    ],
                    [
                        'step' => 'Pilih Virtual Account',
                        'instruction' => 'Pilih "BCA Virtual Account" dari daftar.'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan nomor virtual account yang telah diberikan.'
                    ],
                    [
                        'step' => 'Konfirmasi Detail',
                        'instruction' => 'Periksa detail transaksi, pastikan nama dan jumlah pembayaran sudah benar.'
                    ],
                    [
                        'step' => 'Masukkan PIN',
                        'instruction' => 'Masukkan PIN m-BCA Anda untuk melakukan konfirmasi pembayaran.'
                    ]
                ]
            ],
            [
                'bank_code' => 'bni',
                'name' => 'BNI Virtual Account',
                'is_active' => true,
                'description' => 'Bank Negara Indonesia Virtual Account for secure payments',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke Mobile Banking BNI',
                        'instruction' => 'Buka aplikasi BNI Mobile Banking dan login menggunakan credentials Anda.'
                    ],
                    [
                        'step' => 'Pilih Menu Transfer',
                        'instruction' => 'Pada menu utama, pilih opsi "Transfer".'
                    ],
                    [
                        'step' => 'Pilih Virtual Account',
                        'instruction' => 'Pilih "Virtual Account" dari daftar opsi.'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan 16 digit nomor virtual account yang diberikan.'
                    ],
                    [
                        'step' => 'Konfirmasi Pembayaran',
                        'instruction' => 'Periksa kembali detail transaksi dan klik "Lanjut" untuk konfirmasi.'
                    ],
                    [
                        'step' => 'Selesaikan Transaksi',
                        'instruction' => 'Masukkan password transaksi Anda dan selesaikan pembayaran.'
                    ]
                ]
            ],
            [
                'bank_code' => 'mandiri',
                'name' => 'Mandiri Virtual Account',
                'is_active' => true,
                'description' => 'Bank Mandiri Virtual Account payment channel',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke Livin\' by Mandiri',
                        'instruction' => 'Buka aplikasi Livin\' by Mandiri dan login dengan akun Anda.'
                    ],
                    [
                        'step' => 'Pilih Menu Pembayaran',
                        'instruction' => 'Pada halaman utama, pilih menu "Pembayaran".'
                    ],
                    [
                        'step' => 'Pilih Multipayment',
                        'instruction' => 'Pilih layanan "Multipayment" dari daftar.'
                    ],
                    [
                        'step' => 'Pilih Penyedia Jasa',
                        'instruction' => 'Pilih nama penyedia jasa yang tertera pada instruksi pembayaran.'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan nomor virtual account anda.'
                    ],
                    [
                        'step' => 'Konfirmasi Pembayaran',
                        'instruction' => 'Periksa informasi pembayaran dan klik "Konfirmasi".'
                    ],
                    [
                        'step' => 'Masukkan MPIN',
                        'instruction' => 'Masukkan MPIN Anda untuk menyelesaikan pembayaran.'
                    ]
                ]
            ],
            [
                'bank_code' => 'bri',
                'name' => 'BRI Virtual Account',
                'is_active' => true,
                'description' => 'Bank Rakyat Indonesia Virtual Account for fast transfers',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke BRImo',
                        'instruction' => 'Buka aplikasi BRImo dan login dengan User ID dan PIN Anda.'
                    ],
                    [
                        'step' => 'Pilih BRIVA',
                        'instruction' => 'Pada menu utama, pilih "BRIVA".'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan nomor virtual account BRIVA Anda.'
                    ],
                    [
                        'step' => 'Konfirmasi Detail Pembayaran',
                        'instruction' => 'Periksa detail pembayaran yang muncul pada layar.'
                    ],
                    [
                        'step' => 'Masukkan PIN',
                        'instruction' => 'Masukkan PIN BRImo Anda untuk mengotorisasi pembayaran.'
                    ],
                    [
                        'step' => 'Transaksi Selesai',
                        'instruction' => 'Simpan bukti pembayaran sebagai referensi.'
                    ]
                ]
            ],
            [
                'bank_code' => 'permata',
                'name' => 'Permata Virtual Account',
                'is_active' => true,
                'description' => 'Permata Bank Virtual Account for online payments',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke PermataMobile X',
                        'instruction' => 'Buka aplikasi PermataMobile X dan login dengan kredensial Anda.'
                    ],
                    [
                        'step' => 'Pilih Menu Pembayaran',
                        'instruction' => 'Pada menu utama, pilih "Pembayaran".'
                    ],
                    [
                        'step' => 'Pilih Virtual Account',
                        'instruction' => 'Pilih "Virtual Account" dari daftar opsi pembayaran.'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan nomor virtual account yang diberikan.'
                    ],
                    [
                        'step' => 'Konfirmasi Detail',
                        'instruction' => 'Konfirmasi detail transaksi yang ditampilkan.'
                    ],
                    [
                        'step' => 'Masukkan PIN',
                        'instruction' => 'Masukkan PIN PermataMobile X Anda untuk melakukan konfirmasi pembayaran.'
                    ]
                ]
            ],
            [
                'bank_code' => 'cimb',
                'name' => 'CIMB Niaga Virtual Account',
                'is_active' => false,
                'description' => 'CIMB Niaga Virtual Account payment solution',
                'payment_instructions' => [
                    [
                        'step' => 'Masuk ke OCTO Mobile',
                        'instruction' => 'Buka aplikasi OCTO Mobile dan login dengan User ID dan Password Anda.'
                    ],
                    [
                        'step' => 'Pilih Menu Bayar',
                        'instruction' => 'Pada menu utama, pilih "Bayar".'
                    ],
                    [
                        'step' => 'Pilih Virtual Account',
                        'instruction' => 'Pilih "Virtual Account" dari daftar kategori.'
                    ],
                    [
                        'step' => 'Masukkan Nomor Virtual Account',
                        'instruction' => 'Masukkan nomor virtual account CIMB yang telah diberikan.'
                    ],
                    [
                        'step' => 'Verifikasi Informasi',
                        'instruction' => 'Periksa kembali informasi tagihan yang muncul di layar.'
                    ],
                    [
                        'step' => 'Konfirmasi Pembayaran',
                        'instruction' => 'Masukkan PIN OCTO Mobile Anda untuk menyelesaikan pembayaran.'
                    ]
                ]
            ]
        ];

        // Insert each virtual account into the database
        foreach ($virtualAccounts as $accountData) {
            // Extract payment instructions to JSON
            $paymentInstructions = json_encode($accountData['payment_instructions']);

            // Get the logo path for this bank (if available)
            $logoPath = $logoPaths[$accountData['bank_code']] ?? null;

            // Create the virtual account
            VirtualAccount::create([
                'bank_code' => $accountData['bank_code'],
                'name' => $accountData['name'],
                'is_active' => $accountData['is_active'],
                'description' => $accountData['description'],
                'payment_instructions' => $accountData['payment_instructions'],
                'logo' => $logoPath,
            ]);

            $this->command->info("Created virtual account: {$accountData['name']}");
        }

        $this->command->info('Virtual Account seeding completed!');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $banks = [
            [
                'name' => 'Bank BCA',
                'code' => 'BCA',
                'account_number' => '1234567890',
                'account_name' => 'PT Wedding Organizer',
                'branch' => 'Jakarta Pusat',
                'description' => 'Bank Central Asia',
                'is_active' => true,
            ],
            [
                'name' => 'Bank Mandiri',
                'code' => 'Mandiri',
                'account_number' => '2345678901',
                'account_name' => 'PT Wedding Organizer',
                'branch' => 'Jakarta Selatan',
                'description' => 'Bank Mandiri',
                'is_active' => true,
            ],
            [
                'name' => 'Bank BNI',
                'code' => 'BNI',
                'account_number' => '3456789012',
                'account_name' => 'PT Wedding Organizer',
                'branch' => 'Jakarta Barat',
                'description' => 'Bank Negara Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Bank BRI',
                'code' => 'BRI',
                'account_number' => '4567890123',
                'account_name' => 'PT Wedding Organizer',
                'branch' => 'Jakarta Timur',
                'description' => 'Bank Rakyat Indonesia',
                'is_active' => true,
            ],
        ];

        foreach ($banks as $bank) {
            Bank::updateOrCreate(
                ['code' => $bank['code']],
                $bank
            );
        }
    }
}

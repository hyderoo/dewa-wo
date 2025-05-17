<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BankSeeder::class,
            UserSeeder::class,
            TeamSeeder::class,
            VirtualAccountSeeder::class,
            PortfolioSeeder::class,
            CatalogSeeder::class,
            CustomFeatureSeeder::class,
            OrdersSeeder::class,
            PaymentsSeeder::class,
            ServiceSeeder::class,
            LegalSettingSeeder::class,
        ]);
    }
}

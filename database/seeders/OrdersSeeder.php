<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderCustomFeature;
use App\Models\OrderReview;
use App\Models\Payment;
use App\Models\User;
use App\Models\Catalog;
use App\Models\CustomFeature;
use App\Models\Bank;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin users for payment verification
        $adminUsers = User::where('role', 'admin')->get();
        if ($adminUsers->isEmpty()) {
            $adminUsers = [User::factory()->create(['role' => 'admin'])];
        }

        // Get regular users for orders
        $users = User::where('role', 'user')->get();
        if ($users->isEmpty()) {
            $users = User::factory(3)->create(['role' => 'user']);
        }

        // Get catalogs and custom features
        $catalogs = Catalog::all();
        if ($catalogs->isEmpty()) {
            $this->command->info('No catalogs found. Please run CatalogSeeder first.');
            return;
        }

        $customFeatures = CustomFeature::all();
        if ($customFeatures->isEmpty()) {
            $this->command->info('No custom features found. Please run CustomFeatureSeeder first.');
            return;
        }

        // Get banks for payment methods
        $banks = Bank::all();
        if ($banks->isEmpty()) {
            $this->command->info('No banks found. Running BankSeeder first...');
            $this->call(BankSeeder::class);
            $banks = Bank::all();
        }

        // Sample venues
        $venues = [
            'Shangri-La Ballroom Jakarta',
            'Grand Ballroom Hotel Mulia Senayan',
            'The Glass House Setiabudi',
            'Sampoerna Strategic Square',
            'Ritz-Carlton Pacific Place',
            'Raffles Hotel Jakarta',
            'Fairmont Jakarta',
            'Four Seasons Hotel Jakarta',
            'Mandarin Oriental Jakarta',
            'Kempinski Grand Ballroom Jakarta',
        ];

        // Create orders with different statuses
        $this->createCompletedOrders($users, $catalogs, $customFeatures, $venues, $adminUsers, $banks);
        $this->createOngoingOrders($users, $catalogs, $customFeatures, $venues, $adminUsers, $banks);
        $this->createPendingPaymentOrders($users, $catalogs, $customFeatures, $venues, $banks);
        $this->createCancelledOrders($users, $catalogs, $customFeatures, $venues);
    }

    /**
     * Create completed orders with reviews and full payment history
     */
    private function createCompletedOrders($users, $catalogs, $customFeatures, $venues, $adminUsers, $banks)
    {
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $catalog = $catalogs->random();
            $orderDate = Carbon::now()->subMonths(rand(3, 8));
            $eventDate = $orderDate->copy()->addMonths(rand(1, 3));

            // Calculate total price (catalog + custom features)
            $catalogMinPrice = $catalog->price[0] ?? 15000000;
            $catalogMaxPrice = $catalog->price[1] ?? 30000000;
            $basePrice = rand($catalogMinPrice, $catalogMaxPrice);

            // Select 1-3 custom features
            $selectedFeatures = $customFeatures->random(rand(1, 3));
            $customFeaturesTotal = $selectedFeatures->sum('price');

            // Apply a random discount (0-15%)
            $discountPercent = rand(0, 15);
            $discountAmount = ($basePrice + $customFeaturesTotal) * ($discountPercent / 100);
            $finalPrice = round($basePrice + $customFeaturesTotal - $discountAmount, -3); // Round to nearest thousand

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'catalog_id' => $catalog->id,
                'client_name' => $this->getRandomClientName(),
                'event_date' => $eventDate->format('Y-m-d'),
                'venue' => $venues[array_rand($venues)],
                'estimated_guests' => rand(100, 500),
                'price' => $finalPrice,
                'original_price' => $discountPercent > 0 ? ($basePrice + $customFeaturesTotal) : $finalPrice,
                'discount_percent' => $discountPercent > 0 ? $discountPercent : null,
                'discount_amount' => $discountPercent > 0 ? $discountAmount : null,
                'discount_reason' => $discountPercent > 0 ? $this->getRandomDiscountReason() : null,
                'status' => 'completed',
                'is_fully_paid' => true,
                'paid_amount' => $finalPrice,
                'created_at' => $orderDate,
                'updated_at' => $eventDate->copy()->addDays(rand(1, 7)),
            ]);

            // Add order details
            foreach ($catalog->features as $feature) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'service_name' => $feature,
                    'description' => null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Add custom features
            foreach ($selectedFeatures as $feature) {
                OrderCustomFeature::create([
                    'order_id' => $order->id,
                    'custom_feature_id' => $feature->id,
                    'feature_name' => $feature->name,
                    'price' => $feature->price,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Create payment history (down payment, installments, and final payment)
            $downPaymentAmount = round($finalPrice * 0.3, -3); // 30% down payment
            $remainingAmount = $finalPrice - $downPaymentAmount;
            $installmentCount = rand(1, 3); // 1-3 installments
            $installmentAmount = round($remainingAmount / $installmentCount, -3);

            // Down payment with various methods
            $downPaymentDate = $orderDate->copy()->addDays(rand(1, 3));
            $adminUser = $adminUsers->random();
            $paymentMethod = $this->getRandomPaymentMethod();
            $paymentData = [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_type' => 'down_payment',
                'payment_method' => $paymentMethod,
                'amount' => $downPaymentAmount,
                'status' => 'verified',
                'verified_at' => $downPaymentDate->copy()->addHours(rand(1, 24)),
                'verified_by' => $adminUser->id,
                'created_at' => $downPaymentDate,
                'updated_at' => $downPaymentDate->copy()->addHours(rand(1, 24)),
                'expiry_time' => $downPaymentDate->copy()->addDay(),
            ];

            // Add bank-specific data if the payment method requires it
            if ($paymentMethod === 'bank_transfer') {
                $bank = $banks->random();
                $paymentData['bank_code'] = $bank->code;
                $paymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
            } else if ($paymentMethod === 'virtual_account') {
                $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                $paymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                $paymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                $paymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
            }

            Payment::create($paymentData);

            // Installments
            $paidAmount = $downPaymentAmount;
            for ($j = 1; $j <= $installmentCount; $j++) {
                $installmentDate = $downPaymentDate->copy()->addDays(rand(10, 30) * $j);
                // If it's the last installment, pay the exact remaining amount
                if ($j == $installmentCount) {
                    $paymentAmount = $finalPrice - $paidAmount;
                } else {
                    // For other installments, use the calculated installment amount
                    $paymentAmount = $installmentAmount;
                }
                $paidAmount += $paymentAmount;
                $adminUser = $adminUsers->random();
                $paymentMethod = $this->getRandomPaymentMethod();

                $paymentData = [
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'payment_type' => 'installment',
                    'payment_method' => $paymentMethod,
                    'amount' => $paymentAmount,
                    'status' => 'verified',
                    'verified_at' => $installmentDate->copy()->addHours(rand(1, 24)),
                    'verified_by' => $adminUser->id,
                    'created_at' => $installmentDate,
                    'updated_at' => $installmentDate->copy()->addHours(rand(1, 24)),
                    'expiry_time' => $installmentDate->copy()->addDay(),
                ];

                // Add bank-specific data if the payment method requires it
                if ($paymentMethod === 'bank_transfer') {
                    $bank = $banks->random();
                    $paymentData['bank_code'] = $bank->code;
                    $paymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
                } else if ($paymentMethod === 'virtual_account') {
                    $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                    $paymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                    $paymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                    $paymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
                }

                Payment::create($paymentData);
            }

            // Add review
            $reviewDate = $eventDate->copy()->addDays(rand(1, 14));
            OrderReview::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'rating' => rand(4, 5),
                'comment' => $this->getRandomReview(),
                'created_at' => $reviewDate,
                'updated_at' => $reviewDate,
            ]);
        }
    }

    /**
     * Create ongoing orders with partial payments
     */
    private function createOngoingOrders($users, $catalogs, $customFeatures, $venues, $adminUsers, $banks)
    {
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $catalog = $catalogs->random();
            $orderDate = Carbon::now()->subMonths(rand(1, 3));
            $eventDate = Carbon::now()->addMonths(rand(1, 4));

            // Calculate total price (catalog + custom features)
            $catalogMinPrice = $catalog->price[0] ?? 15000000;
            $catalogMaxPrice = $catalog->price[1] ?? 30000000;
            $basePrice = rand($catalogMinPrice, $catalogMaxPrice);

            // Select 1-3 custom features
            $selectedFeatures = $customFeatures->random(rand(1, 3));
            $customFeaturesTotal = $selectedFeatures->sum('price');

            // Apply a random discount (0-15%)
            $discountPercent = rand(0, 15);
            $discountAmount = ($basePrice + $customFeaturesTotal) * ($discountPercent / 100);
            $finalPrice = round($basePrice + $customFeaturesTotal - $discountAmount, -3); // Round to nearest thousand

            // Calculate down payment and paid amount
            $downPaymentAmount = round($finalPrice * 0.3, -3); // 30% down payment
            $randomProgressPercent = rand(30, 80); // 30-80% paid
            $paidAmount = round($finalPrice * $randomProgressPercent / 100, -3);

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'catalog_id' => $catalog->id,
                'client_name' => $this->getRandomClientName(),
                'event_date' => $eventDate->format('Y-m-d'),
                'venue' => $venues[array_rand($venues)],
                'estimated_guests' => rand(100, 500),
                'price' => $finalPrice,
                'original_price' => $discountPercent > 0 ? ($basePrice + $customFeaturesTotal) : $finalPrice,
                'discount_percent' => $discountPercent > 0 ? $discountPercent : null,
                'discount_amount' => $discountPercent > 0 ? $discountAmount : null,
                'discount_reason' => $discountPercent > 0 ? $this->getRandomDiscountReason() : null,
                'status' => 'ongoing',
                'is_fully_paid' => false,
                'paid_amount' => $paidAmount,
                'created_at' => $orderDate,
                'updated_at' => $orderDate->copy()->addDays(rand(1, 7)),
            ]);

            // Add order details
            foreach ($catalog->features as $feature) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'service_name' => $feature,
                    'description' => null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Add custom features
            foreach ($selectedFeatures as $feature) {
                OrderCustomFeature::create([
                    'order_id' => $order->id,
                    'custom_feature_id' => $feature->id,
                    'feature_name' => $feature->name,
                    'price' => $feature->price,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Create payment history
            // Down payment
            $paymentDate = $orderDate->copy()->addDays(rand(1, 3));
            $adminUser = $adminUsers->random();
            $paymentMethod = $this->getRandomPaymentMethod();

            $paymentData = [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_type' => 'down_payment',
                'payment_method' => $paymentMethod,
                'amount' => $downPaymentAmount,
                'status' => 'verified',
                'verified_at' => $paymentDate->copy()->addHours(rand(1, 24)),
                'verified_by' => $adminUser->id,
                'created_at' => $paymentDate,
                'updated_at' => $paymentDate->copy()->addHours(rand(1, 24)),
                'expiry_time' => $paymentDate->copy()->addDay(),
            ];

            // Add bank-specific data if the payment method requires it
            if ($paymentMethod === 'bank_transfer') {
                $bank = $banks->random();
                $paymentData['bank_code'] = $bank->code;
                $paymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
            } else if ($paymentMethod === 'virtual_account') {
                $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                $paymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                $paymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                $paymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
            }

            Payment::create($paymentData);

            // Additional installments if paid amount is greater than down payment
            if ($paidAmount > $downPaymentAmount) {
                $remainingPaid = $paidAmount - $downPaymentAmount;
                $installmentCount = rand(1, 2);
                $installmentAmount = round($remainingPaid / $installmentCount, -3);

                for ($j = 1; $j <= $installmentCount; $j++) {
                    $installmentDate = $paymentDate->copy()->addDays(rand(10, 30) * $j);
                    // If it's the last installment, use the remaining amount
                    $currentInstallmentAmount = ($j == $installmentCount)
                        ? ($paidAmount - $downPaymentAmount - (($j - 1) * $installmentAmount))
                        : $installmentAmount;

                    $adminUser = $adminUsers->random();
                    $paymentMethod = $this->getRandomPaymentMethod();

                    $paymentData = [
                        'order_id' => $order->id,
                        'user_id' => $user->id,
                        'payment_type' => 'installment',
                        'payment_method' => $paymentMethod,
                        'amount' => $currentInstallmentAmount,
                        'status' => 'verified',
                        'verified_at' => $installmentDate->copy()->addHours(rand(1, 24)),
                        'verified_by' => $adminUser->id,
                        'created_at' => $installmentDate,
                        'updated_at' => $installmentDate->copy()->addHours(rand(1, 24)),
                        'expiry_time' => $installmentDate->copy()->addDay(),
                    ];

                    // Add bank-specific data if the payment method requires it
                    if ($paymentMethod === 'bank_transfer') {
                        $bank = $banks->random();
                        $paymentData['bank_code'] = $bank->code;
                        $paymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
                    } else if ($paymentMethod === 'virtual_account') {
                        $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                        $paymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                        $paymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                        $paymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
                    }

                    Payment::create($paymentData);
                }
            }

            // Randomly add a pending payment for some orders
            if (rand(0, 1)) {
                $pendingAmount = round(($finalPrice - $paidAmount) * rand(30, 50) / 100, -3);
                $pendingDate = Carbon::now()->subDays(rand(1, 3));
                $pendingMethod = rand(0, 1) ? 'bank_transfer' : 'virtual_account';

                $pendingPaymentData = [
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'payment_type' => 'installment',
                    'payment_method' => $pendingMethod,
                    'amount' => $pendingAmount,
                    'status' => 'pending',
                    'created_at' => $pendingDate,
                    'updated_at' => $pendingDate,
                    'expiry_time' => Carbon::now()->addHours(rand(12, 24)),
                ];

                if ($pendingMethod === 'bank_transfer') {
                    $bank = $banks->random();
                    $pendingPaymentData['bank_code'] = $bank->code;
                    $pendingPaymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
                } else {
                    $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                    $pendingPaymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                    $pendingPaymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                    $pendingPaymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
                }

                Payment::create($pendingPaymentData);
            }
        }
    }

    /**
     * Create pending payment orders (just created, no payments yet)
     */
    private function createPendingPaymentOrders($users, $catalogs, $customFeatures, $venues, $banks)
    {
        for ($i = 0; $i < 3; $i++) {
            $user = $users->random();
            $catalog = $catalogs->random();
            $orderDate = Carbon::now()->subDays(rand(1, 5));
            $eventDate = Carbon::now()->addMonths(rand(2, 6));

            // Calculate total price (catalog + custom features)
            $catalogMinPrice = $catalog->price[0] ?? 15000000;
            $catalogMaxPrice = $catalog->price[1] ?? 30000000;
            $basePrice = rand($catalogMinPrice, $catalogMaxPrice);

            // Select 1-3 custom features
            $selectedFeatures = $customFeatures->random(rand(1, 3));
            $customFeaturesTotal = $selectedFeatures->sum('price');

            // Apply a random discount (0-15%)
            $discountPercent = rand(0, 15);
            $discountAmount = ($basePrice + $customFeaturesTotal) * ($discountPercent / 100);
            $finalPrice = round($basePrice + $customFeaturesTotal - $discountAmount, -3); // Round to nearest thousand

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'catalog_id' => $catalog->id,
                'client_name' => $this->getRandomClientName(),
                'event_date' => $eventDate->format('Y-m-d'),
                'venue' => $venues[array_rand($venues)],
                'estimated_guests' => rand(100, 500),
                'price' => $finalPrice,
                'original_price' => $discountPercent > 0 ? ($basePrice + $customFeaturesTotal) : $finalPrice,
                'discount_percent' => $discountPercent > 0 ? $discountPercent : null,
                'discount_amount' => $discountPercent > 0 ? $discountAmount : null,
                'discount_reason' => $discountPercent > 0 ? $this->getRandomDiscountReason() : null,
                'status' => 'pending_payment',
                'is_fully_paid' => false,
                'paid_amount' => 0,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            // Add order details
            foreach ($catalog->features as $feature) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'service_name' => $feature,
                    'description' => null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Add custom features
            foreach ($selectedFeatures as $feature) {
                OrderCustomFeature::create([
                    'order_id' => $order->id,
                    'custom_feature_id' => $feature->id,
                    'feature_name' => $feature->name,
                    'price' => $feature->price,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // For some orders, add a pending payment that hasn't been verified yet
            if (rand(0, 1)) {
                $pendingAmount = round($finalPrice * 0.3, -3); // 30% down payment
                $pendingDate = Carbon::now()->subHours(rand(1, 12));
                $pendingMethod = rand(0, 1) ? 'bank_transfer' : 'virtual_account';

                $pendingPaymentData = [
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'payment_type' => 'down_payment',
                    'payment_method' => $pendingMethod,
                    'amount' => $pendingAmount,
                    'status' => 'pending',
                    'created_at' => $pendingDate,
                    'updated_at' => $pendingDate,
                    'expiry_time' => Carbon::now()->addHours(rand(12, 24)),
                ];

                if ($pendingMethod === 'bank_transfer') {
                    $bank = $banks->random();
                    $pendingPaymentData['bank_code'] = $bank->code;
                    $pendingPaymentData['payment_proof'] = '/storage/payment_proofs/sample_transfer_' . rand(1, 5) . '.jpg';
                } else {
                    $bankCodes = ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'];
                    $pendingPaymentData['bank_code'] = $bankCodes[array_rand($bankCodes)];
                    $pendingPaymentData['va_number'] = '8' . rand(100000000000, 999999999999);
                    $pendingPaymentData['transaction_id'] = 'TRX-' . strtoupper(Str::random(8));
                }

                Payment::create($pendingPaymentData);
            }
        }
    }

    /**
     * Create cancelled orders
     */
    private function createCancelledOrders($users, $catalogs, $customFeatures, $venues)
    {
        for ($i = 0; $i < 2; $i++) {
            $user = $users->random();
            $catalog = $catalogs->random();
            $orderDate = Carbon::now()->subMonths(rand(1, 3));
            $cancelDate = $orderDate->copy()->addDays(rand(2, 10));
            $eventDate = $orderDate->copy()->addMonths(rand(3, 6));

            // Calculate total price (catalog + custom features)
            $catalogMinPrice = $catalog->price[0] ?? 15000000;
            $catalogMaxPrice = $catalog->price[1] ?? 30000000;
            $basePrice = rand($catalogMinPrice, $catalogMaxPrice);

            // Select 1-2 custom features
            $selectedFeatures = $customFeatures->random(rand(1, 2));
            $customFeaturesTotal = $selectedFeatures->sum('price');
            $finalPrice = round($basePrice + $customFeaturesTotal, -3); // Round to nearest thousand

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'catalog_id' => $catalog->id,
                'client_name' => $this->getRandomClientName(),
                'event_date' => $eventDate->format('Y-m-d'),
                'venue' => $venues[array_rand($venues)],
                'estimated_guests' => rand(100, 500),
                'price' => $finalPrice,
                'status' => 'cancelled',
                'is_fully_paid' => false,
                'paid_amount' => 0,
                'created_at' => $orderDate,
                'updated_at' => $cancelDate,
            ]);

            // Add order details
            foreach ($catalog->features as $feature) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'service_name' => $feature,
                    'description' => null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Add custom features
            foreach ($selectedFeatures as $feature) {
                OrderCustomFeature::create([
                    'order_id' => $order->id,
                    'custom_feature_id' => $feature->id,
                    'feature_name' => $feature->name,
                    'price' => $feature->price,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }
        }
    }

    /**
     * Generate a random client name for the order.
     */
    private function getRandomClientName(): string
    {
        $maleNames = ['Andi', 'Budi', 'Doni', 'Eko', 'Fajar', 'Gigih', 'Hadi', 'Irwan', 'Joko', 'Krisna'];
        $femaleNames = ['Ana', 'Bella', 'Cinta', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hana', 'Indah', 'Jasmine'];
        $lastNames = ['Wijaya', 'Santoso', 'Gunawan', 'Setiawan', 'Susanto', 'Kusuma', 'Halim', 'Salim', 'Hidayat', 'Wibowo'];
        $maleName = $maleNames[array_rand($maleNames)];
        $femaleName = $femaleNames[array_rand($femaleNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        return $maleName . ' & ' . $femaleName . ' ' . $lastName;
    }

    /**
     * Get a random payment method.
     */
    private function getRandomPaymentMethod(): string
    {
        $methods = ['bank_transfer', 'virtual_account', 'cash'];
        $weights = [50, 30, 20]; // Higher weight for more common methods
        return $this->weightedRandom($methods, $weights);
    }

    /**
     * Get a random review comment.
     */
    private function getRandomReview(): string
    {
        $reviews = [
            'Pelayanan sangat memuaskan! Tim sangat profesional dan mampu memenuhi semua kebutuhan kami. Kami sangat terkesan dengan hasil akhirnya.',
            'Acara pernikahan kami berjalan dengan lancar berkat bantuan tim yang luar biasa. Semua tamu memuji kualitas dekorasi dan koordinasi acara.',
            'Dekorasi yang dibuat sangat cantik dan sesuai dengan tema yang kami inginkan. Tim bekerja sangat detail dan hasilnya sempurna.',
            'Fotografer dan videografer yang ditugaskan sangat profesional, hasilnya melebihi ekspektasi kami. Moment yang berhasil diambil sangat natural dan indah.',
            'Kami sangat puas dengan pelayanan yang diberikan, semua tamu memuji penyelenggaraan acara kami. Bahkan beberapa teman kami meminta kontak untuk acara mereka nanti.',
            'Tim sangat responsif dan akomodatif terhadap permintaan mendadak kami. Terima kasih atas kesabaran dan profesionalisme yang luar biasa!',
            'Paket pernikahan yang kami pilih sangat worth it, semua kebutuhan kami terpenuhi dengan baik dan hasilnya sesuai dengan yang kami harapkan.',
            'Sangat terkesan dengan kualitas dan profesionalisme tim. Terima kasih telah membuat hari spesial kami semakin berkesan dan berjalan lancar tanpa kendala.',
            'Pelayanan prima dari awal perencanaan hingga hari H. Tim sangat kooperatif dan selalu siap membantu. Hasil sesuai dengan yang diharapkan.',
            'Wedding organizer terbaik yang pernah kami temui. Komunikatif, detail, profesional, dan yang terpenting hasil akhirnya memuaskan.',
        ];
        return $reviews[array_rand($reviews)];
    }

    /**
     * Get a random discount reason.
     */
    private function getRandomDiscountReason(): string
    {
        $reasons = [
            'Promo akhir tahun',
            'Pembayaran di muka',
            'Paket bundling',
            'Diskon pelanggan loyal',
            'Promo bulan ini',
            'Event weekend',
            'Diskon pemesanan jauh-jauh hari',
            'Promo kerja sama venue',
            'Diskon referral',
            'Promo media sosial',
        ];
        return $reasons[array_rand($reasons)];
    }

    /**
     * Get a weighted random value from an array.
     */
    private function weightedRandom(array $values, array $weights): mixed
    {
        $totalWeight = array_sum($weights);
        $rand = mt_rand(1, $totalWeight);
        $currentWeight = 0;
        foreach ($values as $key => $value) {
            $currentWeight += $weights[$key];
            if ($rand <= $currentWeight) {
                return $value;
            }
        }
        return $values[0]; // Fallback
    }
}

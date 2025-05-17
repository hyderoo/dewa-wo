<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

class PaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for verification
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        // Get orders to add payments to
        $orders = Order::all();

        if ($orders->isEmpty()) {
            $this->command->info('No orders found. Please run OrdersTableSeeder first.');
            return;
        }

        foreach ($orders as $order) {
            // Set down payment amount (30% of total price)
            $downPaymentAmount = $order->price * 0.3;
            $order->down_payment_amount = $downPaymentAmount;
            $order->save();

            // Create payments based on order status
            switch ($order->status) {
                case 'completed':
                    // For completed orders, create verified down payment and full payment
                    $this->createDownPayment($order, $admin, true);
                    $this->createFullPayment($order, $admin, true);

                    // Update order payment status
                    $order->paid_amount = $order->price;
                    $order->is_fully_paid = true;
                    $order->save();
                    break;

                case 'ongoing':
                    // For ongoing orders, create verified down payment only
                    $this->createDownPayment($order, $admin, true);

                    // Update order payment status
                    $order->paid_amount = $downPaymentAmount;
                    $order->save();
                    break;

                case 'pending_payment':
                    // For pending orders, create pending down payment (50% chance)
                    if (rand(0, 1) == 1) {
                        $this->createDownPayment($order, $admin, false);
                    }
                    break;

                default:
                    // No payments for other statuses
                    break;
            }
        }
    }

    /**
     * Create a down payment for an order.
     */
    private function createDownPayment(Order $order, User $admin, bool $verified = true): Payment
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_type' => 'down_payment',
            'payment_method' => $this->getRandomPaymentMethod(),
            'amount' => $order->down_payment_amount,
            'payment_proof' => '/storage/payment_proofs/sample_proof.jpg',
            'status' => $verified ? 'verified' : 'pending',
            'note' => $verified ? 'Down payment verified' : null,
            'verified_by' => $verified ? $admin->id : null,
            'verified_at' => $verified ? Carbon::now()->subDays(rand(1, 5)) : null,
        ]);

        return $payment;
    }

    /**
     * Create a full payment (remaining balance) for an order.
     */
    private function createFullPayment(Order $order, User $admin, bool $verified = true): Payment
    {
        $remainingAmount = $order->price - $order->down_payment_amount;

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_type' => 'full_payment',
            'payment_method' => $this->getRandomPaymentMethod(),
            'amount' => $remainingAmount,
            'payment_proof' => '/storage/payment_proofs/sample_proof.jpg',
            'status' => $verified ? 'verified' : 'pending',
            'note' => $verified ? 'Final payment verified' : null,
            'verified_by' => $verified ? $admin->id : null,
            'verified_at' => $verified ? Carbon::now()->subDays(rand(1, 3)) : null,
        ]);

        return $payment;
    }

    /**
     * Get a random payment method.
     */
    private function getRandomPaymentMethod(): string
    {
        $methods = Payment::VALID_METHODS;
        return $methods[array_rand($methods)];
    }
}

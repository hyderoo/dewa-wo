<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Notification;
use Midtrans\Transaction;
use Illuminate\Support\Str;
use Exception;

class MidtransService
{
    public function __construct()
    {
        // Set your Merchant Server Key
        Config::$serverKey = config('midtrans.server_key');
        // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
        Config::$isProduction = config('midtrans.is_production');
        // Set sanitization on (default)
        Config::$isSanitized = config('midtrans.is_sanitized');
        // Set 3DS transaction for credit card to true
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Create transaction for virtual account payment (BCA, BNI, BRI, etc.)
     *
     * @param Order $order
     * @param Payment $payment
     * @param string $bankCode
     * @return array
     */
    public function chargeVirtualAccount(Order $order, Payment $payment, string $bankCode)
    {
        $parameter = [
            'payment_type' => 'bank_transfer',
            'transaction_details' => [
                'order_id' => $payment->id . '-' . Str::random(5),
                'gross_amount' => (int) $payment->amount,
            ],
            'customer_details' => [
                'first_name' => $order->client_name,
                'email' => $order->user->email ?? 'customer@example.com',
                'phone' => $order->user->phone ?? '08123456789',
            ],
            'item_details' => [
                [
                    'id' => $order->id,
                    'price' => (int) $payment->amount,
                    'quantity' => 1,
                    'name' => 'Payment for ' . $order->order_number . ' (' . $payment->payment_type_display . ')',
                ]
            ],
            'custom_field1' => $order->id,
            'custom_field2' => $payment->id,
            'custom_field3' => $payment->payment_type,
        ];

        // Set bank transfer details
        $parameter['bank_transfer'] = [
            'bank' => strtolower($bankCode)
        ];

        // Set free text for specific banks
        if ($bankCode == 'BCA') {
            $parameter['bca_va'] = [
                'va_number' => rand(100000000000, 999999999999),
                'free_text' => [
                    'inquiry' => [
                        [
                            'id' => 'Text ID',
                            'en' => 'Text EN'
                        ]
                    ],
                    'payment' => [
                        [
                            'id' => 'Text ID',
                            'en' => 'Text EN'
                        ]
                    ]
                ]
            ];
        } elseif ($bankCode == 'BNI') {
            $parameter['bni_va'] = [
                'va_number' => rand(100000000000, 999999999999)
            ];
        } elseif ($bankCode == 'Permata') {
            $parameter['permata_va'] = [
                'va_number' => rand(100000000000, 999999999999),
                'recipient_name' => $order->client_name
            ];
        }

        try {
            $response = CoreApi::charge($parameter);
            return [
                'success' => true,
                'transaction_id' => $response->transaction_id,
                'va_number' => $response->va_numbers[0]->va_number ?? $response->permata_va_number ?? null,
                'bank' => $bankCode,
                'status_code' => $response->status_code,
                'status_message' => $response->status_message,
                'expiry_time' => $response->expiry_time ?? null,
                'data' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process Midtrans notification callback
     *
     * @param string $notificationJson
     * @return array
     */
    public function processNotification($notificationJson)
    {
        try {
            $notification = new Notification();

            $orderId = $notification->order_id;
            $statusCode = $notification->status_code;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type;

            // Extract the payment ID from the order ID (paymentId-random)
            $paymentId = explode('-', $orderId)[0];

            // Get custom fields
            $orderId = $notification->custom_field1;
            $paymentId = $notification->custom_field2;
            $paymentType = $notification->custom_field3;

            // Get the payment
            $payment = Payment::find($paymentId);

            if (!$payment) {
                return [
                    'success' => false,
                    'message' => 'Payment not found'
                ];
            }

            // Process the transaction status
            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                // Set payment status to verified
                $payment->status = 'verified';
                $payment->verified_at = now();
                $payment->save();

                // Update order payment
                $order = $payment->order;
                // Use the existing method to update order payment
                app(\App\Http\Controllers\PaymentController::class)->updateOrderPayment($order, $payment);

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'status' => 'verified'
                ];
            } else if ($transactionStatus == 'pending') {
                // Payment is still pending, do nothing or update some payment details
                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'status' => 'pending'
                ];
            } else if (in_array($transactionStatus, ['deny', 'expire', 'cancel', 'failure'])) {
                // Set payment status to rejected
                $payment->status = 'rejected';
                $payment->note = 'Payment ' . $transactionStatus;
                $payment->save();

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'status' => 'rejected'
                ];
            }

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'status' => $payment->status
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Check status of a transaction
     *
     * @param string $orderId
     * @return array
     */
    public function checkTransaction($orderId)
    {
        try {
            $status = Transaction::status($orderId);
            return [
                'success' => true,
                'data' => $status
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

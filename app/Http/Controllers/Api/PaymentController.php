<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\Bank;
use App\Models\Order;
use App\Models\VirtualAccount;
use App\Services\MidtransService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\ApiController;

class PaymentController extends ApiController
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Check payment status
     *
     * @param Payment $payment
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkStatus(Payment $payment)
    {
        try {
            // If payment is already verified or rejected, just return the status
            if (in_array($payment->status, ['verified', 'rejected'])) {
                return response()->json([
                    'status' => $payment->status,
                    'message' => 'Payment ' . $payment->status,
                ]);
            }

            // If payment has transaction_id, check status from Midtrans
            if ($payment->transaction_id) {
                try {
                    $result = $this->midtransService->checkTransaction($payment->transaction_id);

                    if ($result['success']) {
                        // Pastikan data ada dan merupakan objek
                        if (isset($result['data']) && is_object($result['data'])) {
                            $transactionStatus = $result['data']->transaction_status ?? null;
                            $fraudStatus = $result['data']->fraud_status ?? null;

                            Log::info('Midtrans transaction check result', [
                                'payment_id' => $payment->id,
                                'transaction_id' => $payment->transaction_id,
                                'status' => $transactionStatus,
                                'fraud_status' => $fraudStatus
                            ]);

                            // Update payment status based on transaction status
                            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                                if ($fraudStatus == 'accept' || $fraudStatus === null) {
                                    $payment->status = 'verified';
                                    $payment->verified_at = now();
                                    $payment->save();

                                    // Update order payment using PaymentController method
                                    $paymentController = app(\App\Http\Controllers\PaymentController::class);
                                    $paymentController->updateOrderPayment($payment->order, $payment);

                                    return response()->json([
                                        'status' => 'verified',
                                        'message' => 'Payment has been verified',
                                    ]);
                                }
                            } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                                $payment->status = 'rejected';
                                $payment->note = 'Payment ' . $transactionStatus;
                                $payment->save();

                                return response()->json([
                                    'status' => 'rejected',
                                    'message' => 'Payment has been rejected: ' . $transactionStatus,
                                ]);
                            }
                        } else {
                            Log::warning('Invalid response structure from Midtrans', [
                                'payment_id' => $payment->id,
                                'transaction_id' => $payment->transaction_id,
                                'result' => $result
                            ]);
                        }
                    } else {
                        Log::warning('Failed to check transaction with Midtrans', [
                            'payment_id' => $payment->id,
                            'transaction_id' => $payment->transaction_id,
                            'error' => $result['message'] ?? 'Unknown error'
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Exception when calling Midtrans check transaction', [
                        'payment_id' => $payment->id,
                        'transaction_id' => $payment->transaction_id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // If we reach here, payment is still pending
            return response()->json([
                'status' => 'pending',
                'message' => 'Payment is still pending',
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking payment status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payment_id' => $payment->id
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check payment status: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Get payment details for an order
     *
     * @param int $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentDetails($orderId)
    {
        $order = Order::with(['catalog', 'details'])
            ->where('user_id', Auth::id())
            ->find($orderId);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        $banks = Bank::where('is_active', true)->get()->map(function ($bank) {
            return [
                'id' => $bank->id,
                'name' => $bank->name,
                'code' => $bank->code,
                'account_number' => $bank->account_number,
                'account_name' => $bank->account_name,
                'logo' => $bank->logo ? Storage::url($bank->logo) : null,
            ];
        });

        $virtualAccounts = VirtualAccount::where('is_active', true)->get()->map(function ($va) {
            return [
                'id' => $va->id,
                'name' => $va->name,
                'bank_code' => $va->bank_code,
                'logo' => $va->logo ? Storage::url($va->logo) : null,
                'description' => $va->description,
                'payment_instructions' => $va->payment_instructions,
            ];
        });

        // Add additional properties to order for payment options
        $order->down_payment_paid = $this->isDownPaymentPaid($order);
        $order->down_payment_percentage = $this->calculateDownPaymentPercentage($order);

        return $this->successResponse([
            'order' => $order,
            'banks' => $banks,
            'virtual_accounts' => $virtualAccounts,
        ]);
    }

    /**
     * Get payment details for an order
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentDetail($id)
    {
        $payment = Payment::find($id);
        return $this->successResponse($payment);
    }

    /**
     * Check if down payment is already paid
     */
    private function isDownPaymentPaid(Order $order)
    {
        $downPaymentPayments = Payment::where('order_id', $order->id)
            ->where('payment_type', 'down_payment')
            ->where('status', 'verified')
            ->count();

        return $downPaymentPayments > 0;
    }

    /**
     * Calculate down payment percentage
     */
    private function calculateDownPaymentPercentage(Order $order)
    {
        if ($order->price > 0 && $order->down_payment_amount > 0) {
            return round(($order->down_payment_amount / $order->price) * 100);
        }
        return 30; // Default 30%
    }

    /**
     * Submit a bank transfer payment
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitBankTransfer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'bank_code' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Check if order belongs to the authenticated user
        $order = Order::where('user_id', Auth::id())->find($request->order_id);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        // Validate amount does not exceed remaining amount
        if ($request->amount > $order->remaining_amount) {
            return $this->errorResponse('Payment amount cannot exceed the remaining balance');
        }

        // Check if trying to pay down payment when it's already paid
        if ($request->payment_type === 'down_payment' && $this->isDownPaymentPaid($order)) {
            return $this->errorResponse('Down payment has already been paid');
        }

        // Handle file upload
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
        }

        // Create payment
        $payment = Payment::create([
            'order_id' => $request->order_id,
            'user_id' => Auth::id(),
            'payment_type' => $request->payment_type,
            'payment_method' => 'bank_transfer',
            'bank_code' => $request->bank_code,
            'amount' => $request->amount,
            'payment_proof' => $paymentProofPath,
            'status' => 'pending',
            // Set expiry time for 24 hours
            'expiry_time' => now()->addHours(24),
        ]);

        return $this->successResponse([
            'payment_id' => $payment->id,
            'status' => $payment->status,
            'expiry_time' => $payment->expiry_time,
        ], 'Payment submitted successfully and awaiting verification');
    }

    /**
     * Create a virtual account payment
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createVirtualAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'bank_code' => 'required|string',
            'amount' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Check if order belongs to the authenticated user
        $order = Order::where('user_id', Auth::id())->find($request->order_id);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        // Validate amount does not exceed remaining amount
        if ($request->amount > $order->remaining_amount) {
            return $this->errorResponse('Payment amount cannot exceed the remaining balance');
        }

        // Check if trying to pay down payment when it's already paid
        if ($request->payment_type === 'down_payment' && $this->isDownPaymentPaid($order)) {
            return $this->errorResponse('Down payment has already been paid');
        }

        $expiryTime = Carbon::now()->addDay();

        $paymentData = [
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'payment_type' => $request->payment_type,
            'payment_method' => 'virtual_account',
            'bank_code' => $request->bank_code,
            'amount' => $request->amount,
            'status' => 'pending',
            'expiry_time' => $expiryTime,
        ];

        // First, try to process with Midtrans
        $payment = new Payment($paymentData); // Create a temporary object for the Midtrans call
        $payment->save();
        $result = $this->midtransService->chargeVirtualAccount($order, $payment, $request->bank_code);

        if ($result['success']) {
            $payment->transaction_id = $result['transaction_id'];
            $payment->va_number = $result['va_number'];
            $payment->expiry_time = $result['expiry_time'] ? Carbon::parse($result['expiry_time']) : $expiryTime;

            $virtualAccount = VirtualAccount::where('bank_code', $request->bank_code)->first();
            $payment->payment_data = json_encode([
                'transaction_data' => $result,
                'payment_instructions' => $virtualAccount->payment_instructions
            ]);

            $payment->save();

            return $this->successResponse([
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'va_number' => $payment->va_number,
                'amount' => $payment->amount,
                'expiry_time' => $payment->expiry_time,
                'payment_instructions' => $virtualAccount->payment_instructions,
            ], 'Virtual account created successfully');
        } else {
            $payment->delete();
            return $this->errorResponse('Failed to create virtual account', 500);
        }
    }

    /**
     * Check and update expired payments (should be run via scheduler).
     */
    public function checkExpiredPayments()
    {
        try {
            $now = Carbon::now();

            // Find all pending payments that have expired
            $expiredPayments = Payment::where('status', 'pending')
                ->whereNotNull('expiry_time')
                ->where('expiry_time', '<', $now)
                ->get();

            foreach ($expiredPayments as $payment) {
                $payment->status = 'expired';
                $payment->note = 'Payment expired on ' . $now->format('Y-m-d H:i:s');
                $payment->save();

                // Log the expired payment
                Log::info('Payment expired', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                    'expiry_time' => $payment->expiry_time
                ]);
            }

            return $expiredPayments->count();
        } catch (\Exception $e) {
            Log::error('Error checking expired payments', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 0;
        }
    }

    /**
     * Get payment history for an order
     *
     * @param int $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentHistory($orderId)
    {
        $order = Order::with(['catalog'])
            ->where('user_id', Auth::id())
            ->find($orderId);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        $payments = Payment::where('order_id', $orderId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                if ($payment->payment_proof) {
                    $payment->payment_proof_url = Storage::url($payment->payment_proof);
                }
                return $payment;
            });

        return $this->successResponse([
            'order' => $order,
            'payments' => $payments,
        ]);
    }

    /**
     * Update order payment status after a payment is verified.
     */
    private function updateOrderPayment($order, $payment)
    {
        // Get total verified payments for this order
        $totalPaid = Payment::where('order_id', $order->id)
            ->where('status', 'verified')
            ->sum('amount');

        // Update order payment details
        $order->paid_amount = $totalPaid;
        $order->is_fully_paid = ($totalPaid >= $order->price);

        // Update order status based on payment
        if ($order->is_fully_paid && $order->status === 'pending_payment') {
            $order->status = 'ongoing';
        }

        $order->save();

        return true;
    }

    /**
     * Handle Midtrans payment notification
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function notification(Request $request)
    {
        try {
            // Get notification from Midtrans
            $notificationJson = $request->getContent();

            // Log incoming notification
            Log::info('Midtrans notification received', [
                'content' => $notificationJson
            ]);

            // Process the notification using MidtransService
            $result = $this->midtransService->processNotification($notificationJson);

            if ($result['success']) {
                // Get payment from the result
                $paymentId = $result['payment_id'];
                $payment = Payment::find($paymentId);

                if ($payment) {
                    // Update payment status based on transaction status
                    if ($result['status'] === 'verified') {
                        $payment->status = 'verified';
                        $payment->verified_at = now();
                        $payment->save();

                        // Update order payment status
                        $this->updateOrderPayment($payment->order, $payment);

                        Log::info('Payment verified via Midtrans notification', [
                            'payment_id' => $payment->id,
                            'order_id' => $payment->order_id
                        ]);
                    } elseif ($result['status'] === 'rejected') {
                        $payment->status = 'rejected';
                        $payment->note = 'Payment rejected by Midtrans';
                        $payment->save();

                        Log::info('Payment rejected via Midtrans notification', [
                            'payment_id' => $payment->id,
                            'order_id' => $payment->order_id
                        ]);
                    }
                }

                return response()->json(['status' => 'success']);
            } else {
                Log::error('Failed to process Midtrans notification', [
                    'error' => $result['message'] ?? 'Unknown error'
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'] ?? 'Processing failed'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error processing Midtrans notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

/**
 * Helper function to format currency
 */
function formatCurrency($amount)
{
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

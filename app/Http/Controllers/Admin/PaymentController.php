<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\Bank;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Models\VirtualAccount;
use App\Services\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService ?: new MidtransService();
    }

    /**
     * Show payment detail page for processing payments.
     */
    public function detail(Order $order)
    {
        // Get banks for manual transfer
        $banks = Bank::where('is_active', true)->get();

        // Get virtual accounts for online payment
        $virtualAccounts = VirtualAccount::where('is_active', true)->get();

        // Make sure the order is not fully paid
        if ($order->is_fully_paid) {
            return redirect()->route('admin.orders.show', $order->id)->with('toast', [
                'type' => 'info',
                'message' => 'Pesanan ini sudah lunas.'
            ]);
        }

        return Inertia::render('Admin/Payment/PaymentDetail', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'clientName' => $order->client_name,
                'price' => $order->formatted_price,
                'paidAmount' => $order->formatted_paid_amount,
                'remainingAmount' => $order->remaining_amount,
                'requires_down_payment' => $order->requires_down_payment,
                'down_payment_amount_value' => $order->down_payment_amount_value,
            ],
            'banks' => $banks->map(function ($bank) {
                return [
                    'id' => $bank->id,
                    'name' => $bank->name,
                    'code' => $bank->code,
                    'account_number' => $bank->account_number,
                    'account_name' => $bank->account_name,
                    'logo' => $bank->logo ? Storage::url($bank->logo) : null,
                ];
            }),
            'virtualAccounts' => $virtualAccounts->map(function ($va) {
                return [
                    'id' => $va->id,
                    'name' => $va->name,
                    'bank_code' => $va->bank_code,
                    'logo' => $va->logo ? Storage::url($va->logo) : null,
                    'description' => $va->description,
                    'payment_instructions' => $va->payment_instructions,
                ];
            }),
        ]);
    }

    /**
     * Process payment request based on payment method.
     */
    public function process(Request $request, Order $order)
    {
        // Validate the input first
        $validated = $request->validate([
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'payment_method' => 'required|in:bank_transfer,virtual_account,cash',
            'bank_code' => 'required_if:payment_method,bank_transfer,virtual_account',
            'amount' => 'required|numeric|min:1',
            'payment_proof' => 'required_if:payment_method,bank_transfer|nullable|image|max:5120', // 5MB max
        ]);

        // Calculate expiry time (24 hours)
        $expiryTime = Carbon::now()->addDay();

        // Create payment record
        $payment = new Payment();
        $payment->order_id = $order->id;
        $payment->user_id = Auth::id();
        $payment->payment_type = $validated['payment_type'];
        $payment->payment_method = $validated['payment_method'];
        $payment->bank_code = $validated['bank_code'] ?? null;
        $payment->amount = $validated['amount'];
        $payment->status = 'pending';
        $payment->expiry_time = $expiryTime;

        // For cash payment, automatically verify
        if ($validated['payment_method'] === 'cash') {
            $payment->status = 'verified';
            $payment->verified_at = now();
            $payment->verified_by = Auth::id();
        }

        // Handle file upload for bank transfer
        if ($validated['payment_method'] === 'bank_transfer' && $request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
            $payment->payment_proof = $path;
        }

        $payment->save();

        // If this is a cash payment, update the order payment right away
        if ($validated['payment_method'] === 'cash') {
            $paymentController = app(\App\Http\Controllers\PaymentController::class);
            $paymentController->updateOrderPayment($order, $payment);
        }

        return redirect()->route('admin.payments.history', $order->id)->with('toast', [
            'type' => 'success',
            'message' => 'Pembayaran berhasil diproses!'
        ]);
    }

    /**
     * Process payment with Midtrans for VA and other online methods.
     */
    public function processMidtrans(Request $request, Order $order)
    {
        try {
            // Validate the input
            $validated = $request->validate([
                'payment_type' => 'required|in:down_payment,installment,full_payment',
                'payment_method' => 'required|in:virtual_account',
                'bank_code' => 'required',
                'amount' => 'required|numeric|min:1',
            ]);

            // Calculate expiry time (24 hours)
            $expiryTime = Carbon::now()->addDay();

            // Prepare payment data (but don't create the record yet)
            $paymentData = [
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'bank_code' => $validated['bank_code'],
                'amount' => $validated['amount'],
                'status' => 'pending',
                'expiry_time' => $expiryTime,
            ];

            // First, try to process with Midtrans
            $payment = new Payment($paymentData);
            $payment->save();
            $result = $this->midtransService->chargeVirtualAccount($order, $payment, $validated['bank_code']);

            // Only create the payment record if Midtrans transaction is successful
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

                return redirect()->route('admin.payments.history', $order->id)->with('toast', [
                    'type' => 'success',
                    'message' => 'Virtual Account berhasil dibuat! Silakan lakukan pembayaran sebelum ' . $payment->expiry_time->format('d M Y H:i')
                ]);
            } else {
                $payment->delete();
                return redirect()->route('admin.payments.detail', $order->id)->with('toast', [
                    'type' => 'error',
                    'message' => 'Gagal membuat Virtual Account: ' . ($result['message'] ?? 'Terjadi kesalahan')
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing Midtrans payment', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('admin.payments.detail', $order->id)->with('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Add cash payment directly (admin only).
     */
    public function addCashPayment(Request $request, Order $order)
    {
        // Validate the input
        $validated = $request->validate([
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'amount' => 'required|numeric|min:1',
        ]);

        // Create payment record
        $payment = new Payment();
        $payment->order_id = $order->id;
        $payment->user_id = Auth::id();
        $payment->payment_type = $validated['payment_type'];
        $payment->payment_method = 'cash';
        $payment->amount = $validated['amount'];
        $payment->status = 'verified';
        $payment->verified_at = now();
        $payment->verified_by = Auth::id();
        $payment->save();

        // Update the order payment
        $paymentController = app(\App\Http\Controllers\PaymentController::class);
        $paymentController->updateOrderPayment($order, $payment);

        return redirect()->route('admin.payments.history', $order->id)->with('toast', [
            'type' => 'success',
            'message' => 'Pembayaran tunai berhasil ditambahkan!'
        ]);
    }

    /**
     * Display payment history for an order.
     */
    public function history(Order $order)
    {
        // Get all payments for this order with details
        $payments = Payment::where('order_id', $order->id)
            ->with('verifier')
            ->orderBy('created_at', 'desc')
            ->get();

        // Format payments for frontend
        $formattedPayments = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'user_id' => $payment->user_id,
                'payment_type' => $payment->payment_type,
                'payment_type_display' => $payment->payment_type_display,
                'payment_method' => $payment->payment_method,
                'payment_method_display' => $payment->payment_method_display,
                'bank_code' => $payment->bank_code,
                'amount' => $payment->amount,
                'formatted_amount' => $payment->formatted_amount,
                'status' => $payment->status,
                'status_display' => $payment->status_display,
                'transaction_id' => $payment->transaction_id,
                'va_number' => $payment->va_number,
                'payment_proof' => $payment->payment_proof,
                'payment_proof_url' => $payment->payment_proof ? Storage::url($payment->payment_proof) : null,
                'note' => $payment->note,
                'verified_by' => $payment->verified_by,
                'verified_by_name' => $payment->verifier ? $payment->verifier->name : null,
                'verified_at' => $payment->verified_at,
                'expiry_time' => $payment->expiry_time,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
            ];
        });

        return Inertia::render('Admin/Payment/PaymentHistory', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'clientName' => $order->client_name,
                'price' => $order->formatted_price,
                'paidAmount' => $order->formatted_paid_amount,
                'remainingAmount' => $order->formatted_remaining_amount,
                'paymentPercentage' => $order->payment_percentage,
                'isFullyPaid' => $order->is_fully_paid,
            ],
            'payments' => $formattedPayments,
        ]);
    }

    /**
     * Verify a pending payment (manual verification for bank transfer).
     */
    public function verify(Payment $payment)
    {
        // Make sure the payment is in pending status
        if ($payment->status !== 'pending') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Pembayaran ini tidak dapat diverifikasi karena status saat ini adalah ' . $payment->status_display
            ]);
        }

        // Update payment status
        $payment->status = 'verified';
        $payment->verified_at = now();
        $payment->verified_by = Auth::id();
        $payment->save();

        // Update the order payment
        $paymentController = app(\App\Http\Controllers\PaymentController::class);
        $paymentController->updateOrderPayment($payment->order, $payment);

        return redirect()->route('admin.payments.history', $payment->order_id)->with('toast', [
            'type' => 'success',
            'message' => 'Pembayaran berhasil diverifikasi!'
        ]);
    }

    /**
     * Show payment verification page for admin to verify pending payments.
     */
    public function adminVerificationPage()
    {
        // Get all pending bank transfer payments that need verification
        $pendingPayments = Payment::where('status', 'pending')
            ->where('payment_method', 'bank_transfer')
            ->whereNotNull('payment_proof')
            ->with(['order', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Format payments for frontend
        $formattedPayments = $pendingPayments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'order_number' => $payment->order->order_number,
                'client_name' => $payment->order->client_name,
                'user_name' => $payment->user->name,
                'payment_type' => $payment->payment_type_display,
                'amount' => $payment->formatted_amount,
                'payment_proof_url' => Storage::url($payment->payment_proof),
                'created_at' => $payment->created_at->format('d M Y H:i'),
            ];
        });

        // Return inertia page with data
        return Inertia::render('Admin/Payment/PaymentVerification', [
            'payments' => $formattedPayments,
            'pagination' => [
                'total' => $pendingPayments->total(),
                'per_page' => $pendingPayments->perPage(),
                'current_page' => $pendingPayments->currentPage(),
                'last_page' => $pendingPayments->lastPage(),
            ],
        ]);
    }
}

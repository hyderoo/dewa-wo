<?php

namespace App\Http\Controllers;

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
     * Show payment details
     */
    public function detail($orderId)
    {
        $order = Order::with(['catalog', 'details'])
            ->where('user_id', Auth::id())
            ->findOrFail($orderId);

        $banks = Bank::where('is_active', true)->get();

        // Get virtual accounts for online payment
        $virtualAccounts = VirtualAccount::where('is_active', true)->get();

        // Add additional properties to order for payment options
        $order->down_payment_paid = $this->isDownPaymentPaid($order);
        $order->down_payment_percentage = $this->calculateDownPaymentPercentage($order);

        return Inertia::render('User/Payment/Detail', [
            'order' => $order,
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
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
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
     * Process bank transfer payment (manual verification)
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'payment_method' => 'required|string',
            'bank_code' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        // Check if order belongs to the authenticated user
        $order = Order::where('user_id', Auth::id())->findOrFail($request->order_id);

        // Validate amount does not exceed remaining amount
        if ($request->amount > $order->remaining_amount) {
            return back()->withErrors(['amount' => 'Jumlah pembayaran tidak boleh melebihi sisa pembayaran.']);
        }

        // Check if trying to pay down payment when it's already paid
        if ($request->payment_type === 'down_payment' && $this->isDownPaymentPaid($order)) {
            return back()->withErrors(['payment_type' => 'Uang muka sudah dibayar sebelumnya.']);
        }

        // Handle file upload
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
        }

        // Create payment
        Payment::create([
            'order_id' => $request->order_id,
            'user_id' => Auth::id(),
            'payment_type' => $request->payment_type,
            'payment_method' => 'bank_transfer', // Store as bank_transfer in the database
            'bank_code' => $request->bank_code,
            'amount' => $request->amount,
            'payment_proof' => $paymentProofPath,
            'status' => 'pending',
            // Set expiry time for 24 hours
            'expiry_time' => now()->addHours(24),
        ]);

        return redirect()->route('payments.success')->with('success', 'Pembayaran berhasil dikirim dan sedang menunggu verifikasi admin!');
    }

    /**
     * Process virtual account payment (automatic verification)
     */
    public function virtualAccount(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_type' => 'required|in:down_payment,installment,full_payment',
            'payment_method' => 'required|string',
            'bank_code' => 'required|string',
            'amount' => 'required|numeric|min:1',
        ]);

        // Check if order belongs to the authenticated user
        $order = Order::where('user_id', Auth::id())->findOrFail($request->order_id);

        // Validate amount does not exceed remaining amount
        if ($request->amount > $order->remaining_amount) {
            return back()->withErrors(['amount' => 'Jumlah pembayaran tidak boleh melebihi sisa pembayaran.']);
        }

        // Check if trying to pay down payment when it's already paid
        if ($request->payment_type === 'down_payment' && $this->isDownPaymentPaid($order)) {
            return back()->withErrors(['payment_type' => 'Uang muka sudah dibayar sebelumnya.']);
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

            return redirect()->route('payment.status', $payment->id)->with('success', 'Virtual Account berhasil dibuat! Silakan lakukan pembayaran sebelum ' . $payment->expiry_time->format('d M Y H:i'));
        } else {
            $payment->delete();
            return back()->withErrors(['toast' => 'Virtual Account gagal dibuat!']);
        }
    }

    /**
     * Show payment success page
     */
    public function success()
    {
        return Inertia::render('User/Payment/Success', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Show payment status
     */
    public function status($paymentId)
    {
        $payment = Payment::with(['order'])
            ->where('id', $paymentId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('User/Payment/Status', [
            'payment' => $payment,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Show payment history
     */
    public function history($orderId)
    {
        $order = Order::with(['catalog'])
            ->where('user_id', Auth::id())
            ->findOrFail($orderId);

        $payments = Payment::where('order_id', $orderId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Add payment_proof_url to each payment if available
        foreach ($payments as $payment) {
            if ($payment->payment_proof) {
                $payment->payment_proof_url = Storage::url($payment->payment_proof);
            }
        }

        return Inertia::render('User/Payment/History', [
            'order' => $order,
            'payments' => $payments,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Update order payment status after a payment is verified.
     */
    public function updateOrderPayment(Order $order, Payment $payment)
    {
        try {
            DB::beginTransaction();

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

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating order payment', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
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

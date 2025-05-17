<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Catalog;
use App\Models\OrderDetail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\CustomFeature;
use App\Models\OrderCustomFeature;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the user.
     */
    public function index()
    {
        // Get ongoing orders (not completed and not cancelled)
        $orders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get completed orders
        $completedOrders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get completed orders
        $cancelledOrders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->where('status', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Order/Order', [
            'orders' => $orders,
            'completedOrders' => $completedOrders,
            'cancelledOrders' => $cancelledOrders,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display a listing of orders for the user.
     */
    public function completed()
    {
        // Get ongoing orders (not completed and not cancelled)
        $orders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get completed orders
        $completedOrders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get completed orders
        $cancelledOrders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->where('status', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Order/Order', [
            'orders' => $orders,
            'completedOrders' => $completedOrders,
            'cancelledOrders' => $cancelledOrders,
            'active' => 'completed',
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display a specific order.
     */
    public function show($id)
    {
        $order = Order::with(['catalog', 'details', 'customFeatures', 'payments'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('User/Orders/Show', [
            'order' => $order,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'catalog_id' => 'required|exists:catalogs,id',
            'client_name' => 'required|string|max:255',
            'event_date' => 'required|date|after:today',
            'venue' => 'required|string|max:255',
            'estimated_guests' => 'required|integer|min:1',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'price' => 'sometimes|numeric',
            'original_price' => 'sometimes|numeric',
        ]);

        // Get the catalog
        $catalog = Catalog::findOrFail($request->catalog_id);

        // Generate a unique order number
        $orderNumber = 'ORD-' . strtoupper(Str::random(8));

        // Calculate price if not provided
        $price = $validated['price'] ?? 0;
        $originalPrice = $validated['original_price'] ?? $price;

        if ($price === 0 && is_array($catalog->price) && count($catalog->price) >= 2) {
            // Default to the lower end of the price range if not specified
            $price = $catalog->price[0];
            $originalPrice = $price;
        }

        // Calculate down payment (30% of total price)
        $downPaymentAmount = $price * 0.3;

        // Create the order
        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => Auth::id(),
            'catalog_id' => $catalog->id,
            'client_name' => $validated['client_name'],
            'event_date' => $validated['event_date'],
            'venue' => $validated['venue'],
            'estimated_guests' => $validated['estimated_guests'],
            'price' => $price,
            'original_price' => $originalPrice,
            'down_payment_amount' => $downPaymentAmount,
            'status' => 'pending_payment',
            'is_fully_paid' => false,
            'paid_amount' => 0,
        ]);

        // Add order details from catalog features
        if (is_array($catalog->features)) {
            foreach ($catalog->features as $feature) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'service_name' => $feature,
                    'description' => null,
                ]);
            }
        }

        // Redirect to payment details page
        return redirect()->route('payment.detail', ['order' => $order->id])->with('success', 'Order created successfully! Please complete your payment.');
    }

    /**
     * Store a newly created custom order.
     */
    public function storeCustom(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'event_date' => 'required|date|after:today',
            'venue' => 'required|string|max:255',
            'estimated_guests' => 'required|integer|min:1',
            'custom_features' => 'required|array|min:1',
            'custom_features.*' => 'exists:custom_features,id',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'alt_phone' => 'nullable|string|max:20',
            'price' => 'sometimes|numeric',
            'original_price' => 'sometimes|numeric',
        ]);

        // Generate a unique order number
        $orderNumber = 'ORD-' . strtoupper(Str::random(8));

        // Get the selected custom features
        $selectedFeatures = CustomFeature::whereIn('id', $validated['custom_features'])->get();

        // Calculate total price
        $price = $validated['price'] ?? $selectedFeatures->sum('price');
        $originalPrice = $validated['original_price'] ?? $price;

        // Calculate down payment (30% of total price)
        $downPaymentAmount = $price * 0.3;

        // Create the order
        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => Auth::id(),
            'catalog_id' => null, // Custom order, no catalog
            'client_name' => $validated['client_name'],
            'event_date' => $validated['event_date'],
            'venue' => $validated['venue'],
            'estimated_guests' => $validated['estimated_guests'],
            'price' => $price,
            'original_price' => $originalPrice,
            'down_payment_amount' => $downPaymentAmount,
            'status' => 'pending_payment',
            'is_fully_paid' => false,
            'paid_amount' => 0,
        ]);

        // Add custom features to order
        foreach ($selectedFeatures as $feature) {
            OrderCustomFeature::create([
                'order_id' => $order->id,
                'custom_feature_id' => $feature->id,
                'feature_name' => $feature->name,
                'price' => $feature->price,
            ]);

            // Also add to order details for consistency
            OrderDetail::create([
                'order_id' => $order->id,
                'service_name' => $feature->name,
                'description' => $feature->description,
            ]);
        }

        // Redirect to payment details page
        return redirect()->route('payment.detail', ['order' => $order->id])
            ->with('success', 'Pesanan kustom Anda berhasil dibuat! Silakan lanjutkan ke pembayaran.');
    }

    /**
     * Cancel an order
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', Auth::id())->findOrFail($id);

        // Only allow cancellation if status is pending_payment
        if ($order->status !== 'pending_payment') {
            return redirect()->route('orders')->with('error', 'Hanya pesanan dengan status menunggu pembayaran yang dapat dibatalkan.');
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason', 'Dibatalkan oleh pengguna')
        ]);

        return redirect()->route('orders')->with('success', 'Pesanan berhasil dibatalkan.');
    }

    /**
     * Show cancel order confirmation page
     *
     * @param int $id
     * @return \Inertia\Response
     */
    public function showCancelForm($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->where('status', 'pending_payment')
            ->findOrFail($id);

        return Inertia::render('User/Order/CancelOrder', [
            'order' => $order,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Mark an order as completed
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function complete($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->whereIn('status', ['in_progress', 'ongoing']) // Allow both status values for flexibility
            ->findOrFail($id);

        // Check if the order is fully paid
        if (!$order->is_fully_paid) {
            return back()->with('error', 'Pesanan harus dibayar penuh sebelum dapat diselesaikan.');
        }

        // Update order status
        $order->status = 'completed';
        $order->completed_at = now();
        $order->save();

        return back()->with('success', 'Pesanan berhasil diselesaikan!');
    }

    /**
     * Store a review for the order.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function review(Request $request, $id)
    {
        // Validate request
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Get the order
        $order = Order::where('user_id', Auth::id())
            ->where('status', 'completed')
            ->findOrFail($id);

        // Check if order already has a review
        if ($order->review()->exists()) {
            return back()->with('error', 'Anda sudah memberikan ulasan untuk pesanan ini.');
        }

        // Create the review
        $order->review()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return back()->with('success', 'Terima kasih atas ulasan Anda!');
    }
}

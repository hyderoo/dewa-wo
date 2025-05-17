<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Catalog;
use App\Models\OrderDetail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\CustomFeature;
use App\Models\OrderCustomFeature;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OrderController extends ApiController
{
    /**
     * Get all orders for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $orders = Order::with(['catalog', 'customFeatures', 'review'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($orders);
    }

    /**
     * Get orders by status for the authenticated user
     *
     * @param string $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByStatus($status)
    {
        $validStatuses = ['pending_payment', 'ongoing', 'completed', 'cancelled'];

        if (!in_array($status, $validStatuses)) {
            return $this->errorResponse('Invalid status parameter');
        }

        $orders = Order::with(['catalog', 'review', 'customFeatures'])
            ->where('user_id', Auth::id())
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($orders);
    }

    /**
     * Get a specific order for the authenticated user
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $order = Order::with(['catalog', 'details', 'customFeatures', 'payments'])
            ->where('user_id', Auth::id())
            ->find($id);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        return $this->successResponse($order);
    }

    /**
     * Create a new order
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'catalog_id' => 'required|exists:catalogs,id',
            'client_name' => 'required|string|max:255',
            'event_date' => 'required|date|after:today',
            'venue' => 'required|string|max:255',
            'estimated_guests' => 'required|integer|min:1',
            'price' => 'sometimes|numeric',
            'original_price' => 'sometimes|numeric',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Get the catalog
        $catalog = Catalog::findOrFail($request->catalog_id);

        // Generate a unique order number
        $orderNumber = 'ORD-' . strtoupper(Str::random(8));

        // Calculate price if not provided
        $price = $request->price ?? 0;
        $originalPrice = $request->original_price ?? $price;

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
            'client_name' => $request->client_name,
            'event_date' => $request->event_date,
            'venue' => $request->venue,
            'estimated_guests' => $request->estimated_guests,
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

        // Return with full order details
        $order->load(['catalog', 'details']);

        return $this->successResponse($order, 'Order created successfully', 201);
    }

    /**
     * Create a new order
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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

        // Return with full order details
        $order->load(['catalog', 'details']);

        return $this->successResponse($order, 'Order created successfully', 201);
    }

    /**
     * Cancel an order
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', Auth::id())->find($id);

        if (!$order) {
            return $this->notFoundResponse('Order not found');
        }

        // Only allow cancellation if status is pending_payment
        if ($order->status !== 'pending_payment') {
            return $this->errorResponse('Only pending payment orders can be cancelled');
        }

        $reason = $request->input('reason', 'Cancelled by user');

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);

        return $this->successResponse($order, 'Order cancelled successfully');
    }

    /**
     * Mark an order as completed
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function complete($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->whereIn('status', ['in_progress', 'ongoing'])
            ->find($id);

        if (!$order) {
            return $this->notFoundResponse('Order not found or cannot be completed');
        }

        // Check if the order is fully paid
        if (!$order->is_fully_paid) {
            return $this->errorResponse('Order must be fully paid before it can be completed');
        }

        // Update order status
        $order->status = 'completed';
        $order->completed_at = now();
        $order->save();

        return $this->successResponse($order, 'Order completed successfully');
    }

    /**
     * Submit a review for an order
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitReview(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $order = Order::where('user_id', Auth::id())
            ->where('status', 'completed')
            ->find($id);

        if (!$order) {
            return $this->notFoundResponse('Completed order not found');
        }

        // Check if order already has a review
        if ($order->review()->exists()) {
            return $this->errorResponse('You have already submitted a review for this order');
        }

        // Create the review
        $review = $order->review()->create([
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'comment' => $request->comment ?? null,
        ]);

        return $this->successResponse($review, 'Review submitted successfully');
    }
}

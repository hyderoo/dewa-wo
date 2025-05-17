<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders with filtering and pagination.
     */
    public function index(Request $request)
    {
        // Extract filter parameters from request
        $filters = $request->only(['status', 'search', 'date', 'payment', 'discount', 'page']);
        $perPage = 10; // Number of orders per page

        // Start building the query
        $query = Order::with(['review', 'details', 'customFeatures', 'catalog'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                    ->orWhere('order_number', 'like', "%{$search}%")
                    ->orWhere('venue', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['date']) && $filters['date'] !== 'all') {
            $today = Carbon::today();

            switch ($filters['date']) {
                case 'past':
                    $query->where('event_date', '<', $today);
                    break;
                case 'today':
                    $query->whereDate('event_date', $today);
                    break;
                case 'this_week':
                    $query->whereBetween('event_date', [$today, $today->copy()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereBetween('event_date', [$today, $today->copy()->endOfMonth()]);
                    break;
                case 'next_month':
                    $nextMonth = $today->copy()->addMonth();
                    $query->whereBetween('event_date', [$nextMonth->startOfMonth(), $nextMonth->endOfMonth()]);
                    break;
                case 'future':
                    $query->where('event_date', '>=', $today);
                    break;
            }
        }

        if (!empty($filters['payment']) && $filters['payment'] !== 'all') {
            switch ($filters['payment']) {
                case 'fully_paid':
                    $query->where('is_fully_paid', true);
                    break;
                case 'partial':
                    $query->where('is_fully_paid', false)
                        ->where('paid_amount', '>', 0);
                    break;
                case 'unpaid':
                    $query->where(function ($q) {
                        $q->where('paid_amount', 0)
                            ->orWhereNull('paid_amount');
                    });
                    break;
            }
        }

        if (!empty($filters['discount']) && $filters['discount'] !== 'all') {
            switch ($filters['discount']) {
                case 'with_discount':
                    $query->where(function ($q) {
                        $q->where('discount_amount', '>', 0)
                            ->orWhere('discount_percent', '>', 0);
                    });
                    break;
                case 'no_discount':
                    $query->where(function ($q) {
                        $q->whereNull('discount_amount')
                            ->orWhere('discount_amount', '=', 0);
                    })->where(function ($q) {
                        $q->whereNull('discount_percent')
                            ->orWhere('discount_percent', '=', 0);
                    });
                    break;
            }
        }

        // Get paginated results
        $orders = $query->paginate($perPage);

        // Format orders for frontend
        $formattedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'clientName' => $order->client_name,
                'packageName' => $order->catalog ? $order->catalog->name : 'Custom Package',
                'date' => $order->event_date,
                'venue' => $order->venue,
                'price' => $order->formatted_price,
                'status' => $order->status,
                'hasReviewed' => $order->has_reviewed,
                'hasDiscount' => $order->has_discount,
                'discountPercent' => $order->discount_percent,
                'formattedDiscountPercent' => $order->formatted_discount_percent,
                'originalPrice' => $order->formatted_original_price,
                'isFullyPaid' => $order->is_fully_paid,
                'paidAmount' => $order->formatted_paid_amount,
                'remainingAmount' => $order->formatted_remaining_amount,
                'paymentPercentage' => $order->payment_percentage,
                'review' => $order->review ? [
                    'rating' => $order->review->rating,
                    'comment' => $order->review->comment,
                    'date' => $order->review->created_at,
                ] : null,
                'details' => [
                    'estimatedGuests' => $order->estimated_guests,
                    'includedServices' => $order->included_services,
                ],
            ];
        });

        // Prepare pagination data
        $pagination = [
            'total' => $orders->total(),
            'per_page' => $orders->perPage(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'from' => $orders->firstItem(),
            'to' => $orders->lastItem(),
            'prev_page_url' => $orders->previousPageUrl(),
            'next_page_url' => $orders->nextPageUrl(),
            'links' => $orders->linkCollection()->toArray(),
        ];

        return Inertia::render('Admin/Order/OrderManagement', [
            'orders' => $formattedOrders,
            'pagination' => $pagination,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new order.
     */
    public function create()
    {
        return Inertia::render('Admin/Order/OrderForm', [
            'catalogs' => \App\Models\Catalog::orderBy('name')->get(),
            'customFeatures' => \App\Models\CustomFeature::orderBy('name')->get(),
            'users' => \App\Models\User::where('role', 'user')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        // Log the request for debugging
        Log::info('Order store request', [
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'catalog_id' => 'sometimes|nullable|exists:catalogs,id',
            'client_name' => 'required|string|max:255',
            'event_date' => 'required|date|after:today',
            'venue' => 'required|string|max:255',
            'estimated_guests' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'original_price' => 'sometimes|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_reason' => 'nullable|string|max:255',
            'down_payment_amount' => 'nullable|numeric|min:0',
            'included_services' => 'sometimes|array',
            'included_services.*' => 'string|max:255',
            'custom_features' => 'sometimes|array',
            'custom_features.*.id' => 'exists:custom_features,id',
            'custom_features.*.name' => 'required|string|max:255',
            'custom_features.*.price' => 'required|numeric|min:0',
        ]);

        // Generate order number
        $orderNumber = 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8));

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => $request->user_id,
            'catalog_id' => $validated['catalog_id'] ?? null,
            'client_name' => $validated['client_name'],
            'event_date' => $validated['event_date'],
            'venue' => $validated['venue'],
            'estimated_guests' => $validated['estimated_guests'],
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? $validated['price'],
            'discount_percent' => $validated['discount_percent'] ?? null,
            'discount_amount' => $validated['discount_amount'] ?? null,
            'discount_reason' => $validated['discount_reason'] ?? null,
            'down_payment_amount' => $validated['down_payment_amount'] ?? null,
            'status' => 'pending_payment',
            'paid_amount' => 0,
            'is_fully_paid' => false,
        ]);

        // Create order details
        if (isset($validated['included_services'])) {
            foreach ($validated['included_services'] as $service) {
                $order->details()->create([
                    'service_name' => $service,
                ]);
            }
        }

        // Create custom features
        if (isset($validated['custom_features'])) {
            foreach ($validated['custom_features'] as $feature) {
                $order->customFeatures()->create([
                    'custom_feature_id' => $feature['id'] ?? null,
                    'feature_name' => $feature['name'],
                    'price' => $feature['price'],
                ]);
            }
        }

        return redirect()->route('admin.orders')->with('toast', [
            'type' => 'success',
            'message' => 'Order created successfully!'
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load(['review', 'details', 'customFeatures', 'catalog']);

        return Inertia::render('Admin/Order/OrderDetail', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'clientName' => $order->client_name,
                'packageName' => $order->catalog ? $order->catalog->name : 'Custom Package',
                'date' => $order->event_date,
                'venue' => $order->venue,
                'price' => $order->formatted_price,
                'originalPrice' => $order->original_price,
                'formattedOriginalPrice' => $order->formatted_original_price,
                'discount_percent' => $order->discount_percent,
                'discount_amount' => $order->discount_amount,
                'discount_reason' => $order->discount_reason,
                'hasDiscount' => $order->has_discount,
                'formattedDiscountAmount' => $order->formatted_discount_amount,
                'formattedDiscountPercent' => $order->formatted_discount_percent,
                'paidAmount' => $order->formatted_paid_amount,
                'remainingAmount' => $order->formatted_remaining_amount,
                'paymentPercentage' => $order->payment_percentage,
                'status' => $order->status,
                'isFullyPaid' => $order->is_fully_paid,
                'hasReviewed' => $order->has_reviewed,
                'review' => $order->review ? [
                    'rating' => $order->review->rating,
                    'comment' => $order->review->comment,
                    'date' => $order->review->created_at,
                ] : null,
                'details' => [
                    'estimatedGuests' => $order->estimated_guests,
                    'includedServices' => $order->included_services,
                ],
                'customFeatures' => $order->customFeatures->map(function ($feature) {
                    return [
                        'id' => $feature->id,
                        'name' => $feature->feature_name,
                        'price' => $feature->formatted_price,
                    ];
                }),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified order.
     */
    public function edit(Order $order)
    {
        $order->load(['details', 'customFeatures', 'catalog']);

        return Inertia::render('Admin/Order/OrderForm', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'client_name' => $order->client_name,
                'catalog_id' => $order->catalog_id,
                'event_date' => $order->event_date->format('Y-m-d'),
                'venue' => $order->venue,
                'estimated_guests' => $order->estimated_guests,
                'price' => $order->price,
                'original_price' => $order->original_price ?? $order->price,
                'discount_percent' => $order->discount_percent,
                'discount_amount' => $order->discount_amount,
                'discount_reason' => $order->discount_reason,
                'down_payment_amount' => $order->down_payment_amount,
                'status' => $order->status,
                'is_fully_paid' => $order->is_fully_paid,
                'paid_amount' => $order->paid_amount,
            ],
            'catalogs' => \App\Models\Catalog::all(),
            'customFeatures' => \App\Models\CustomFeature::all(),
            'users' => \App\Models\User::where('role', 'user')->orderBy('name')->get(),
            'includedServices' => $order->details->pluck('service_name'),
            'selectedCustomFeatures' => $order->customFeatures->map(function ($feature) {
                return [
                    'id' => $feature->custom_feature_id,
                    'name' => $feature->feature_name,
                    'price' => $feature->price,
                ];
            }),
        ]);
    }

    /**
     * Update the specified order in storage.
     */
    public function update(Request $request, Order $order)
    {
        // Log the request for debugging
        Log::info('Order update request', [
            'order_id' => $order->id,
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'catalog_id' => 'sometimes|nullable|exists:catalogs,id',
            'client_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'venue' => 'required|string|max:255',
            'estimated_guests' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'original_price' => 'sometimes|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_reason' => 'nullable|string|max:255',
            'down_payment_amount' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:pending_payment,ongoing,completed,cancelled',
            'included_services' => 'sometimes|array',
            'included_services.*' => 'string|max:255',
            'custom_features' => 'sometimes|array',
            'custom_features.*.id' => 'sometimes|nullable|exists:custom_features,id',
            'custom_features.*.name' => 'required|string|max:255',
            'custom_features.*.price' => 'required|numeric|min:0',
        ]);

        // Update order
        $order->update([
            'user_id' => $request->user_id,
            'catalog_id' => $validated['catalog_id'] ?? null,
            'client_name' => $validated['client_name'],
            'event_date' => $validated['event_date'],
            'venue' => $validated['venue'],
            'estimated_guests' => $validated['estimated_guests'],
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? $validated['price'],
            'discount_percent' => $validated['discount_percent'] ?? null,
            'discount_amount' => $validated['discount_amount'] ?? null,
            'discount_reason' => $validated['discount_reason'] ?? null,
            'down_payment_amount' => $validated['down_payment_amount'] ?? null,
            'status' => $validated['status'] ?? $order->status,
        ]);

        // Update order details
        if (isset($validated['included_services'])) {
            // Delete existing details
            $order->details()->delete();

            // Create new details
            foreach ($validated['included_services'] as $service) {
                $order->details()->create([
                    'service_name' => $service,
                ]);
            }
        }

        // Update custom features
        if (isset($validated['custom_features'])) {
            // Delete existing custom features
            $order->customFeatures()->delete();

            // Create new custom features
            foreach ($validated['custom_features'] as $feature) {
                $order->customFeatures()->create([
                    'custom_feature_id' => $feature['id'] ?? null,
                    'feature_name' => $feature['name'],
                    'price' => $feature['price'],
                ]);
            }
        }

        return redirect()->route('admin.orders')->with('toast', [
            'type' => 'success',
            'message' => 'Order updated successfully!'
        ]);
    }

    /**
     * Update the status of an order with additional information
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending_payment,ongoing,completed,cancelled',
            'cancel_reason' => 'nullable|required_if:status,cancelled|string|max:255',
        ]);

        // Check if we can complete the order
        if ($validated['status'] === 'completed') {
            // Optional: You may want to check if the order is fully paid before completing
            if (!$order->is_fully_paid) {
                // If you want to enforce full payment before completion, uncomment this
                // return back()->with('toast', [
                //     'type' => 'error',
                //     'message' => 'Pesanan harus lunas sebelum dapat diselesaikan.'
                // ]);

                // Or alternatively, just log a warning
                Log::warning("Completing order {$order->id} that is not fully paid");
            }
        }

        // Save the status change
        $updateData = [
            'status' => $validated['status']
        ];

        // If cancelling, save the reason
        if ($validated['status'] === 'cancelled' && isset($validated['cancel_reason'])) {
            $updateData['cancel_reason'] = $validated['cancel_reason'];
            $updateData['cancelled_at'] = now();
            $updateData['cancelled_by'] = Auth::id();
        }

        // If completing, set completed timestamp
        if ($validated['status'] === 'completed') {
            $updateData['completed_at'] = now();
            $updateData['completed_by'] = Auth::id();
        }

        $order->update($updateData);

        // Return appropriate success response
        $successMessage = '';
        switch ($validated['status']) {
            case 'completed':
                $successMessage = 'Pesanan berhasil ditandai sebagai selesai';
                break;
            case 'cancelled':
                $successMessage = 'Pesanan berhasil dibatalkan';
                break;
            case 'ongoing':
                $successMessage = 'Status pesanan diubah menjadi berlangsung';
                break;
            case 'pending_payment':
                $successMessage = 'Status pesanan diubah menjadi menunggu pembayaran';
                break;
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => $successMessage
        ]);
    }

    /**
     * Store a review for an order with enhanced validation
     */
    public function storeReview(Request $request, Order $order)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        // Check if a review already exists
        if ($order->has_reviewed) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Pesanan ini sudah memiliki ulasan.'
            ]);
        }

        // Check if the order is completed
        if ($order->status !== 'completed') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Hanya pesanan yang sudah selesai yang dapat diulas.'
            ]);
        }

        $order->review()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Ulasan berhasil dikirim!'
        ]);
    }

    /**
     * Show the review form for an order.
     */
    public function showReviewForm(Order $order)
    {
        return Inertia::render('Admin/Order/ReviewForm', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'clientName' => $order->client_name,
                'date' => $order->event_date,
                'venue' => $order->venue,
            ]
        ]);
    }

    /**
     * Export orders to CSV.
     */
    public function export(Request $request)
    {
        // Apply the same filters as in the index method
        $filters = $request->only(['status', 'search', 'date', 'payment', 'discount']);

        // Start building the query
        $query = Order::with(['review', 'details', 'customFeatures', 'catalog'])
            ->orderBy('created_at', 'desc');

        // Apply filters (same as in index method)
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Additional filters omitted for brevity (would be same as index method)

        $orders = $query->get();

        // Generate CSV
        $filename = 'orders_export_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');

            // Add header row
            fputcsv($file, [
                'Order Number',
                'Client Name',
                'Package',
                'Event Date',
                'Venue',
                'Guests',
                'Original Price',
                'Discount',
                'Final Price',
                'Paid Amount',
                'Remaining',
                'Status',
                'Created At',
            ]);

            // Add data rows
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->client_name,
                    $order->catalog ? $order->catalog->name : 'Custom Package',
                    $order->event_date->format('Y-m-d'),
                    $order->venue,
                    $order->estimated_guests,
                    $order->original_price ?? $order->price,
                    $order->has_discount ? ($order->discount_amount . ' (' . $order->discount_percent . '%)') : 'No Discount',
                    $order->price,
                    $order->paid_amount ?? 0,
                    $order->remaining_amount,
                    ucfirst($order->status),
                    $order->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Order $order)
    {
        // Delete the order which will cascade to delete details, custom features, and reviews
        $order->delete();

        return redirect()->route('admin.orders')->with('toast', [
            'type' => 'success',
            'message' => 'Order deleted successfully!'
        ]);
    }

    /**
     * Get a list of booked dates for the date picker
     */
    public function getBookedDates()
    {
        // Get all booked dates from orders
        $bookedDates = Order::where('status', '!=', 'cancelled')
            ->whereDate('event_date', '>=', now())
            ->pluck('event_date')
            ->map(function ($date) {
                return Carbon::parse($date)->format('Y-m-d');
            })
            ->toArray();

        return response()->json([
            'bookedDates' => $bookedDates
        ]);
    }

    /**
     * Check if a specific date is available
     */
    public function checkDateAvailability(Request $request)
    {
        $date = $request->input('date');

        // Check if the date already exists in any non-cancelled order
        $isBooked = Order::where('status', '!=', 'cancelled')
            ->whereDate('event_date', $date)
            ->exists();

        return response()->json([
            'available' => !$isBooked,
            'date' => $date
        ]);
    }
}

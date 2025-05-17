<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use Illuminate\Http\Request;

class ReviewController extends ApiController
{
    /**
     * Get all active services
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $reviews = \App\Models\OrderReview::with(['order', 'user'])
            ->where('rating', '>=', 4)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'client_name' => $review->order ? $review->order->client_name : ($review->user ? $review->user->name : 'Anonymous'),
                    'client_avatar' => $review->user->avatar,
                    'event_type' => $review->order && $review->order->catalog ? $review->order->catalog->name : 'Custom',
                ];
            });

        return $this->successResponse($reviews);
    }
}

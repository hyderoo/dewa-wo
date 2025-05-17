<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Inertia\Inertia;
use App\Models\Order;
use Inertia\Response;
use App\Models\Catalog;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    /**
     * Display the home page.
     */
    public function home(): Response
    {
        $services = Service::where('is_active', true)
            ->orderBy('type')
            ->orderBy('title')
            ->get();

        $portfolios = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])
            ->latest()
            ->take(6)
            ->get();

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
                    'event_type' => $review->order && $review->order->catalog ? $review->order->catalog->name : 'Custom',
                ];
            });

        return Inertia::render('User/Home/Home', [
            'portfolios' => $portfolios,
            'services' => $services,
            'reviews' => $reviews,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the about page.
     */
    public function about(): Response
    {
        return Inertia::render('User/About/About', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the features page.
     */
    public function features(): Response
    {
        $catalogs = Catalog::all();
        return Inertia::render('User/Catalog/Catalog', [
            'catalogs' => $catalogs,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the team page.
     */
    public function team(): Response
    {
        $team = Team::all();

        return Inertia::render('User/Team/OurTeam', [
            'team' => $team,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the catalog page.
     */
    public function catalog(): Response
    {
        $catalogs = Catalog::all();

        return Inertia::render('User/Catalog/Catalog', [
            'catalogs' => $catalogs,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the portfolio page.
     */
    public function portfolio(): Response
    {
        // Eager load images with each portfolio
        $portfolios = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])
            ->get();

        return Inertia::render('User/Home/Partials/Portfolio', [
            'portfolios' => $portfolios,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the payment details page.
     */
    public function paymentDetails(Request $request): Response
    {
        $orderId = $request->id;
        $order = null;

        if ($orderId) {
            $order = Order::with(['catalog'])->findOrFail($orderId);

            // Check if the order belongs to the authenticated user
            if ($order->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }
        }

        return Inertia::render('User/Order/DetailPembayaran', [
            'order' => $order,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the payment success page.
     */
    public function paymentSuccess(): Response
    {
        return Inertia::render('User/Order/PaymentSuccess', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the privacy policy page.
     */
    public function privacyPolicy(): Response
    {
        $privacyPolicy = \App\Models\LegalSetting::where('type', 'privacy_policy')->first();

        return Inertia::render('User/Legal/PrivacyPolicy', [
            'policy' => $privacyPolicy,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the terms and conditions page.
     */
    public function termsConditions(): Response
    {
        $termsConditions = \App\Models\LegalSetting::where('type', 'terms_conditions')->first();

        return Inertia::render('User/Legal/TermsConditions', [
            'terms' => $termsConditions,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}

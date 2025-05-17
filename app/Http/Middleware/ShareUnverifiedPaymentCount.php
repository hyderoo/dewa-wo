<?php

namespace App\Http\Middleware;

use Closure;
use Inertia\Inertia;
use App\Models\Payment;
use Illuminate\Support\Facades\Cache;

class ShareUnverifiedPaymentCount
{
    public function handle($request, Closure $next)
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            $unverifiedCount = Payment::where('status', 'pending')->where('payment_method', Payment::METHOD_BANK_TRANSFER)->count();
            Inertia::share('unverifiedPaymentCount', $unverifiedCount);
        }

        return $next($request);
    }
}

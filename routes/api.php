<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\LegalController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\MasterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::prefix('v1')->group(function () {
    Route::get('/booked-dates', [AvailabilityController::class, 'getBookedDates'])->name('api.booked-dates');
    Route::get('/monthly-availability/{year}/{month}', [AvailabilityController::class, 'getMonthlyAvailability'])->name('api.monthly-availability');
    Route::get('/check-date-availability/{date}', [AvailabilityController::class, 'checkDateAvailability'])
        ->name('api.check-date-availability');

    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Catalogs
    Route::get('/catalogs', [CatalogController::class, 'index']);
    Route::get('/catalogs/custom-features', [CatalogController::class, 'getCustomFeatures'])->name('custom.features');
    Route::get('/catalogs/{id}', [CatalogController::class, 'show']);
    Route::get('/catalogs/type/{type}', [CatalogController::class, 'getByType']);

    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::get('/services/type/{type}', [ServiceController::class, 'getByType']);

    // Portfolio
    Route::get('/portfolios', [PortfolioController::class, 'index']);
    Route::get('/portfolios/latest/{limit?}', [PortfolioController::class, 'latest']);
    Route::get('/portfolios/{id}', [PortfolioController::class, 'show']);
    Route::get('/portfolios/category/{category}', [PortfolioController::class, 'getByCategory']);

    // Team
    Route::get('/team', [TeamController::class, 'index']);
    Route::get('/team/highlighted', [TeamController::class, 'highlighted']);
    Route::get('/team/{id}', [TeamController::class, 'show']);

    // Legal
    Route::get('/privacy-policy', [LegalController::class, 'privacyPolicy']);
    Route::get('/terms-conditions', [LegalController::class, 'termsConditions']);

    // Payment callback (for Midtrans)
    Route::post('/payments/notification', [PaymentController::class, 'notification']);
    Route::get('/payments/{payment}/check-status', [PaymentController::class, 'checkStatus']);

    Route::get('/reviews', [ReviewController::class, 'index']);

    Route::get('/banks', [MasterController::class, 'banks']);
    Route::get('/va', [MasterController::class, 'va']);
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/profile', [UserProfileController::class, 'profile']);
    Route::put('/profile', [UserProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [UserProfileController::class, 'changePassword']);
    Route::delete('/profile', [UserProfileController::class, 'deleteAccount']);

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/custom', [OrderController::class, 'storeCustom']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::put('/orders/{id}/complete', [OrderController::class, 'complete']);
    Route::post('/orders/{id}/review', [OrderController::class, 'submitReview']);
    Route::get('/orders/status/{status}', [OrderController::class, 'getByStatus']);

    // Payments
    Route::get('/payments/order/{orderId}', [PaymentController::class, 'getPaymentDetails']);
    Route::post('/payments/bank-transfer', [PaymentController::class, 'submitBankTransfer']);
    Route::post('/payments/virtual-account', [PaymentController::class, 'createVirtualAccount']);
    Route::get('/payments/history/{orderId}', [PaymentController::class, 'getPaymentHistory']);
    Route::get('/payments/{id}', [PaymentController::class, 'getPaymentDetail']);
    Route::get('/payments/{paymentId}/status', [PaymentController::class, 'checkStatus']);
});

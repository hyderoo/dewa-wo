<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/features', [PageController::class, 'features'])->name('features');
Route::get('/team', [PageController::class, 'team'])->name('team');
Route::get('/portfolio', [PageController::class, 'portfolio'])->name('portfolio');
Route::get('/privacy-policy', [PageController::class, 'privacyPolicy'])->name('privacy.policy');
Route::get('/terms-conditions', [PageController::class, 'termsConditions'])->name('terms.conditions');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes
Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Logout
    Route::get('/logout-page', [AuthController::class, 'showLogout'])->name('logout.page');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Order routes
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/completed', [OrderController::class, 'completed'])->name('orders.completed');
    Route::post('/orders/custom', [OrderController::class, 'storeCustom'])->name('custom.store');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{id}/cancel', [OrderController::class, 'showCancelForm'])->name('orders.cancel.form');
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{id}/complete', [OrderController::class, 'complete'])->name('orders.complete');
    Route::post('/orders/{id}/review', [OrderController::class, 'review'])->name('orders.review');

    // Payment routes
    Route::post('/payments/store', [PaymentController::class, 'store'])->name('payments.store');
    Route::post('/payments/virtual-account', [PaymentController::class, 'virtualAccount'])->name('payments.virtual_account');
    Route::get('/payments/success', [PaymentController::class, 'success'])->name('payments.success');
    Route::get('/payments/status/{payment}', [PaymentController::class, 'status'])->name('payment.status');
    Route::get('/payments/history/{order}', [PaymentController::class, 'history'])->name('payment.history');
    Route::get('/payments/{order}', [PaymentController::class, 'detail'])->name('payment.detail');
});

require __DIR__ . '/admin.php';

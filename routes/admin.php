<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\BankController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CatalogController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\PasswordController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PortfolioController;
use App\Http\Controllers\Admin\LegalSettingController;
use App\Http\Controllers\Admin\CustomFeatureController;
use App\Http\Controllers\Admin\VirtualAccountController;

// Admin Authentication Routes
Route::prefix('admin')->name('admin.')->group(function () {
    // Guest routes (for unauthorized users)
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login.attempt');
    });

    // Authenticated admin routes
    Route::middleware('admin.auth')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
    });
});

Route::prefix('admin')->middleware(['admin.auth'])->name('admin.')->group(function () {
    Route::get('', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/change-password', [PasswordController::class, 'changePassword'])->name('password.change');

    // User management routes
    Route::get('users', [UserController::class, 'index'])->name('users');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::put('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('users/{user}/send-reset-link', [UserController::class, 'sendPasswordResetLink'])->name('users.send-reset-link');

    // Portfolio routes
    Route::get('portfolios', [PortfolioController::class, 'index'])->name('portfolios');
    Route::post('portfolios', [PortfolioController::class, 'store'])->name('portfolios.store');
    Route::put('portfolios/{portfolio}', [PortfolioController::class, 'update'])->name('portfolios.update');
    Route::delete('portfolios/{portfolio}', [PortfolioController::class, 'destroy'])->name('portfolios.destroy');

    // Team routes
    Route::get('teams', [TeamController::class, 'index'])->name('teams');
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::put('teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

    // Catalog routes
    Route::get('catalogs', [CatalogController::class, 'index'])->name('catalogs');
    Route::post('catalogs', [CatalogController::class, 'store'])->name('catalogs.store');
    Route::put('catalogs/{catalog}', [CatalogController::class, 'update'])->name('catalogs.update');
    Route::delete('catalogs/{catalog}', [CatalogController::class, 'destroy'])->name('catalogs.destroy');

    // Custom Features routes
    Route::get('custom-features', [CustomFeatureController::class, 'index'])->name('catalogs.features');
    Route::post('custom-features', [CustomFeatureController::class, 'store'])->name('catalogs.features.store');
    Route::put('custom-features/{feature}', [CustomFeatureController::class, 'update'])->name('catalogs.features.update');
    Route::delete('custom-features/{feature}', [CustomFeatureController::class, 'destroy'])->name('catalogs.features.destroy');
    Route::get('custom-features/all', [CustomFeatureController::class, 'getAll'])->name('catalogs.features.all');

    // Order routes
    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('orders/{order}/review', [OrderController::class, 'storeReview'])->name('orders.review');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::get('orders/{order}/review-form', [OrderController::class, 'showReviewForm'])->name('orders.review-form');

    // Payment routes
    Route::get('payments/verification', [PaymentController::class, 'adminVerificationPage'])->name('payments.verification');
    Route::post('payments/{order}/add-cash', [PaymentController::class, 'addCashPayment'])->name('payments.add-cash');
    Route::patch('payments/{payment}/verify', [PaymentController::class, 'verify'])->name('payments.verify');
    Route::get('payments/{order}/history', [PaymentController::class, 'history'])->name('payments.history');
    Route::get('payment/{order}', [PaymentController::class, 'detail'])->name('payments.detail');
    Route::post('payment/{order}/process', [PaymentController::class, 'process'])->name('payments.process');
    Route::post('payment/{order}/midtrans', [PaymentController::class, 'processMidtrans'])->name('payments.midtrans');

    // Service management routes
    Route::get('services', [ServiceController::class, 'index'])->name('services');
    Route::post('services', [ServiceController::class, 'store'])->name('services.store');
    Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    Route::patch('services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

    // Legal settings routes
    Route::get('privacy-policy', [LegalSettingController::class, 'privacyPolicy'])->name('privacy-policy');
    Route::post('privacy-policy', [LegalSettingController::class, 'updatePrivacyPolicy'])->name('privacy-policy.update');
    Route::get('terms-conditions', [LegalSettingController::class, 'termsConditions'])->name('terms-conditions');
    Route::post('terms-conditions', [LegalSettingController::class, 'updateTermsConditions'])->name('terms-conditions.update');

    // Bank Management Routes
    Route::get('banks', [BankController::class, 'index'])->name('banks');
    Route::post('banks', [BankController::class, 'store'])->name('banks.store');
    Route::put('banks/{bank}', [BankController::class, 'update'])->name('banks.update');
    Route::delete('banks/{bank}', [BankController::class, 'destroy'])->name('banks.destroy');
    Route::patch('banks/{bank}/toggle-active', [BankController::class, 'toggleActive'])->name('banks.toggle-active');

    // Virtual Account Routes
    Route::get('virtual-accounts', [VirtualAccountController::class, 'index'])->name('virtual-accounts');
    Route::post('virtual-accounts', [VirtualAccountController::class, 'store'])->name('virtual-accounts.store');
    Route::put('virtual-accounts/{virtualAccount}', [VirtualAccountController::class, 'update'])->name('virtual-accounts.update');
    Route::delete('virtual-accounts/{virtualAccount}', [VirtualAccountController::class, 'destroy'])->name('virtual-accounts.destroy');
    Route::patch('virtual-accounts/{virtualAccount}/toggle-active', [VirtualAccountController::class, 'toggleActive'])->name('virtual-accounts.toggle-active');
});

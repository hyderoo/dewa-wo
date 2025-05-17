<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register custom URL validation that requires https
        Validator::extend('secure_url', function ($attribute, $value, $parameters, $validator) {
            return filter_var($value, FILTER_VALIDATE_URL) !== false &&
                strpos($value, 'https://') === 0;
        }, 'The :attribute must be a valid HTTPS URL.');

        // Make sure public storage is linked
        // if (!file_exists(public_path('storage'))) {
        //     $this->app->make('files')->link(
        //         storage_path('app/public'),
        //         public_path('storage')
        //     );
        // }
    }
}

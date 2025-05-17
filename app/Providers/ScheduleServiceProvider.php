<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;
use App\Console\Commands\CheckExpiredPaymentsCommand;

class ScheduleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(Schedule::class, function ($app) {
            return $app->make(\Illuminate\Console\Scheduling\Schedule::class);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            // Pemeriksaan pembayaran yang sudah kadaluarsa
            $schedule->command('payments:check-expired')->everyMinute();
        });
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\PaymentController;

class CheckExpiredPaymentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and update expired payments';

    /**
     * Execute the console command.
     */
    public function handle(PaymentController $paymentController)
    {
        try {
            $this->info('Checking for expired payments...');

            $count = $paymentController->checkExpiredPayments();

            $this->info("Processed {$count} expired payments.");

            Log::info("CheckExpiredPaymentsCommand completed: {$count} payments marked as expired.");

            return 0;
        } catch (\Exception $e) {
            $this->error("An error occurred: {$e->getMessage()}");

            Log::error('Error in CheckExpiredPaymentsCommand', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }
    }
}

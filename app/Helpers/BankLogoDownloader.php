<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BankLogoDownloader
{
    /**
     * Download bank logos for sample virtual accounts
     *
     * @return array Mapping of bank codes to logo paths
     */
    public static function downloadBankLogos()
    {
        // Create storage directory if it doesn't exist
        $storagePath = storage_path('app/public/va_logos');
        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }

        // Sample bank logo URLs (replace with actual URLs in production)
        $bankLogos = [
            'bca' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1200px-Bank_Central_Asia.svg.png',
            'bni' => 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/1200px-BNI_logo.svg.png',
            'mandiri' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/1200px-Bank_Mandiri_logo_2016.svg.png',
            'bri' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/1200px-BANK_BRI_logo.svg.png',
            'permata' => 'https://upload.wikimedia.org/wikipedia/id/thumb/9/94/PermataBank_logo.svg/1280px-PermataBank_logo.svg.png',
            'cimb' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/CIMB_Logo.svg/1200px-CIMB_Logo.svg.png',
        ];

        $logoPaths = [];

        foreach ($bankLogos as $bankCode => $logoUrl) {
            try {
                // Download the image
                $response = Http::get($logoUrl);

                if ($response->successful()) {
                    // Generate filename and save path
                    $filename = "va_logos/{$bankCode}_logo.png";

                    // Store the file
                    Storage::disk('public')->put($filename, $response->body());

                    // Store the path for the bank
                    $logoPaths[$bankCode] = $filename;

                    Log::info("Downloaded logo for {$bankCode}");
                } else {
                    Log::warning("Failed to download logo for {$bankCode}: HTTP status {$response->status()}");
                }
            } catch (\Exception $e) {
                Log::error("Error downloading logo for {$bankCode}: {$e->getMessage()}");
            }
        }

        return $logoPaths;
    }
}

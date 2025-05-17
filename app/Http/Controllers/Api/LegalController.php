<?php

namespace App\Http\Controllers\Api;

use App\Models\LegalSetting;
use Illuminate\Http\Request;

class LegalController extends ApiController
{
    /**
     * Get privacy policy
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function privacyPolicy()
    {
        $privacyPolicy = LegalSetting::where('type', 'privacy_policy')->first();

        if (!$privacyPolicy) {
            return $this->notFoundResponse('Privacy policy not found');
        }

        return $this->successResponse($privacyPolicy);
    }

    /**
     * Get terms and conditions
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function termsConditions()
    {
        $termsConditions = LegalSetting::where('type', 'terms_conditions')->first();

        if (!$termsConditions) {
            return $this->notFoundResponse('Terms and conditions not found');
        }

        return $this->successResponse($termsConditions);
    }
}

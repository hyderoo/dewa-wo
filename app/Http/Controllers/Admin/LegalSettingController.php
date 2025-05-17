<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalSettingController extends Controller
{
    public function privacyPolicy()
    {
        $privacyPolicy = LegalSetting::firstOrCreate(
            ['type' => 'privacy_policy'],
            ['content' => '', 'version' => '1.0']
        );

        return Inertia::render('Admin/Legal/PrivacyPolicyManagement', [
            'privacyPolicy' => $privacyPolicy->content,
            'version' => $privacyPolicy->version
        ]);
    }

    public function updatePrivacyPolicy(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'version' => 'required|string'
        ]);

        $setting = LegalSetting::updateOrCreate(
            ['type' => 'privacy_policy'],
            [
                'content' => $validated['content'],
                'version' => $validated['version']
            ]
        );

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Kebijakan Privasi berhasil diperbarui!'
        ]);
    }

    public function termsConditions()
    {
        $termsConditions = LegalSetting::firstOrCreate(
            ['type' => 'terms_conditions'],
            ['content' => '', 'version' => '1.0']
        );

        return Inertia::render('Admin/Legal/TermsConditionsManagement', [
            'termsConditions' => $termsConditions->content,
            'version' => $termsConditions->version
        ]);
    }

    public function updateTermsConditions(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'version' => 'required|string'
        ]);

        $setting = LegalSetting::updateOrCreate(
            ['type' => 'terms_conditions'],
            [
                'content' => $validated['content'],
                'version' => $validated['version']
            ]
        );

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Syarat & Ketentuan berhasil diperbarui!'
        ]);
    }
}

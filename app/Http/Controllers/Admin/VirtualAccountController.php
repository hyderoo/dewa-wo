<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VirtualAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VirtualAccountController extends Controller
{
    /**
     * Display a listing of the virtual accounts.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $virtualAccounts = VirtualAccount::all()->map(function ($virtualAccount) {
            return [
                'id' => $virtualAccount->id,
                'bank_code' => $virtualAccount->bank_code,
                'name' => $virtualAccount->name,
                'account_number' => $virtualAccount->account_number,
                'is_active' => $virtualAccount->is_active,
                'description' => $virtualAccount->description,
                'logo' => $virtualAccount->logo ? Storage::url($virtualAccount->logo) : null,
                'payment_instructions' => $virtualAccount->payment_instructions,
            ];
        });

        return Inertia::render('Admin/VirtualAccount/VirtualAccountManagement', [
            'virtualAccounts' => $virtualAccounts,
        ]);
    }

    /**
     * Store a newly created virtual account in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|max:2048',
            'payment_instructions' => 'nullable|array',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('va_logos', 'public');
        }

        VirtualAccount::create($validated);

        return redirect()->route('admin.virtual-accounts')->with('toast', [
            'type' => 'success',
            'message' => 'Virtual Account berhasil ditambahkan!'
        ]);
    }

    /**
     * Update the specified virtual account in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\VirtualAccount  $virtualAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, VirtualAccount $virtualAccount)
    {
        $validated = $request->validate([
            'bank_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|max:2048',
            'payment_instructions' => 'nullable|array',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($virtualAccount->logo) {
                Storage::disk('public')->delete($virtualAccount->logo);
            }
            $validated['logo'] = $request->file('logo')->store('va_logos', 'public');
        } else {
            unset($validated['logo']);
        }

        $virtualAccount->update($validated);

        return redirect()->route('admin.virtual-accounts')->with('toast', [
            'type' => 'success',
            'message' => 'Virtual Account berhasil diperbarui!'
        ]);
    }

    /**
     * Remove the specified virtual account from storage.
     *
     * @param  \App\Models\VirtualAccount  $virtualAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(VirtualAccount $virtualAccount)
    {
        // Check if the virtual account is used in any payment
        $isUsed = \App\Models\Payment::where('payment_method', 'virtual_account')
            ->where('bank_code', $virtualAccount->bank_code)
            ->exists();

        if ($isUsed) {
            return redirect()->route('admin.virtual-accounts')->with('toast', [
                'type' => 'error',
                'message' => 'Virtual Account tidak dapat dihapus karena digunakan dalam pembayaran!'
            ]);
        }

        // Delete logo if exists
        if ($virtualAccount->logo) {
            Storage::disk('public')->delete($virtualAccount->logo);
        }

        $virtualAccount->delete();

        return redirect()->route('admin.virtual-accounts')->with('toast', [
            'type' => 'success',
            'message' => 'Virtual Account berhasil dihapus!'
        ]);
    }

    /**
     * Toggle the active status of the virtual account.
     *
     * @param  \App\Models\VirtualAccount  $virtualAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleActive(VirtualAccount $virtualAccount)
    {
        $virtualAccount->is_active = !$virtualAccount->is_active;
        $virtualAccount->save();

        return redirect()->route('admin.virtual-accounts')->with('toast', [
            'type' => 'success',
            'message' => 'Status Virtual Account berhasil diubah!'
        ]);
    }
}

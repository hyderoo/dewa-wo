<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BankController extends Controller
{
    /**
     * Display a listing of the banks.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $banks = Bank::all()->map(function ($bank) {
            return [
                'id' => $bank->id,
                'name' => $bank->name,
                'code' => $bank->code,
                'account_number' => $bank->account_number,
                'account_name' => $bank->account_name,
                'branch' => $bank->branch,
                'logo' => $bank->logo ? Storage::url($bank->logo) : null,
                'is_active' => $bank->is_active,
                'description' => $bank->description,
            ];
        });

        return Inertia::render('Admin/Bank/BankManagement', [
            'banks' => $banks,
        ]);
    }

    /**
     * Store a newly created bank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:banks,code',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('bank_logos', 'public');
        }

        Bank::create($validated);

        return redirect()->route('admin.banks')->with('toast', [
            'type' => 'success',
            'message' => 'Bank berhasil ditambahkan!'
        ]);
    }

    /**
     * Update the specified bank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Bank $bank)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:banks,code,' . $bank->id,
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);
        if ($request->hasFile('logo')) {
            if ($bank->logo) {
                Storage::disk('public')->delete($bank->logo);
            }

            $validated['logo'] = $request->file('logo')->store('bank_logos', 'public');
        } else {
            unset($validated['logo']);
        }
        $bank->update($validated);

        return redirect()->route('admin.banks')->with('toast', [
            'type' => 'success',
            'message' => 'Bank berhasil diperbarui!'
        ]);
    }

    /**
     * Remove the specified bank from storage.
     *
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Bank $bank)
    {
        // Check if the bank is used in any payment
        $isUsed = \App\Models\Payment::where('bank_code', $bank->code)->exists();

        if ($isUsed) {
            return redirect()->route('admin.banks')->with('toast', [
                'type' => 'error',
                'message' => 'Bank tidak dapat dihapus karena digunakan dalam pembayaran!'
            ]);
        }

        // Delete logo if it exists
        if ($bank->logo) {
            Storage::disk('public')->delete($bank->logo);
        }

        $bank->delete();

        return redirect()->route('admin.banks')->with('toast', [
            'type' => 'success',
            'message' => 'Bank berhasil dihapus!'
        ]);
    }

    /**
     * Toggle the active status of the bank.
     *
     * @param  \App\Models\Bank  $bank
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleActive(Bank $bank)
    {
        $bank->is_active = !$bank->is_active;
        $bank->save();

        return redirect()->route('admin.banks')->with('toast', [
            'type' => 'success',
            'message' => 'Status bank berhasil diubah!'
        ]);
    }
}

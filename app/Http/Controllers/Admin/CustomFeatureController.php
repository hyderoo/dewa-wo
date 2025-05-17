<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomFeatureController extends Controller
{
    /**
     * Display a listing of the custom features.
     */
    public function index()
    {
        // Get all features and sort them case-insensitively by name
        $features = CustomFeature::all()
            ->sortBy(function ($feature) {
                return strtolower($feature->name);
            })
            ->values(); // Re-index the collection after sorting

        return Inertia::render('Admin/CustomFeature/CustomFeatureManagement', [
            'features' => $features
        ]);
    }

    /**
     * Store a newly created custom feature in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $feature = CustomFeature::create($validated);

        Log::info('Custom feature created', ['id' => $feature->id]);

        return redirect()->route('admin.catalogs.features')->with('toast', [
            'type' => 'success',
            'message' => 'Feature added successfully!'
        ]);
    }

    /**
     * Update the specified custom feature in storage.
     * Note: Using POST method with _method=PUT for consistency
     */
    public function update(Request $request, CustomFeature $feature)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            '_method' => 'sometimes|in:PUT',  // Allow _method field for method spoofing
        ]);

        // Remove _method from validated data
        if (isset($validated['_method'])) {
            unset($validated['_method']);
        }

        $feature->update($validated);

        Log::info('Custom feature updated', ['id' => $feature->id]);

        return redirect()->route('admin.catalogs.features')->with('toast', [
            'type' => 'success',
            'message' => 'Feature updated successfully!'
        ]);
    }

    /**
     * Remove the specified custom feature from storage.
     */
    public function destroy(CustomFeature $feature)
    {
        $feature->delete();

        Log::info('Custom feature deleted', ['id' => $feature->id]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Feature deleted successfully!'
        ]);
    }

    /**
     * Get all custom features (for API requests)
     */
    public function getAll()
    {
        $features = CustomFeature::all()
            ->sortBy(function ($feature) {
                return strtolower($feature->name);
            })
            ->values();

        return response()->json($features);
    }
}

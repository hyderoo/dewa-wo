<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Catalog;
use App\Models\CustomFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Display a listing of the catalogs.
     */
    public function index()
    {
        // Get all catalogs and sort them case-insensitively by name
        $catalogs = Catalog::all()
            ->sortBy(function ($catalog) {
                return strtolower($catalog->name);
            })
            ->values() // Re-index the collection after sorting
            ->map(function ($catalog) {
                // Add the formatted price for display
                $catalog->formatted_price = $catalog->formattedPrice;
                return $catalog;
            });

        $customFeatures = CustomFeature::all();

        return Inertia::render('Admin/Catalog/CatalogManagement', [
            'catalogs' => $catalogs,
            'customFeatures' => $customFeatures
        ]);
    }

    /**
     * Store a newly created catalog in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'required|numeric|gte:min_price',
            'type' => 'required|string',
            'features' => 'nullable|array',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'max_price.gte' => 'Harga maksimum harus lebih besar dari atau sama dengan harga minimum.'
        ]);

        // Convert min and max price to price array
        $priceArray = [$validated['min_price'], $validated['max_price']];

        // Remove individual price fields and add the array
        unset($validated['min_price'], $validated['max_price']);
        $validated['price'] = $priceArray;

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('catalog_images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $catalog = Catalog::create($validated);

        Log::info('Catalog created', [
            'id' => $catalog->id,
            'price_range' => $priceArray
        ]);

        return redirect()->route('admin.catalogs')->with('toast', [
            'type' => 'success',
            'message' => 'Catalog added successfully!'
        ]);
    }

    /**
     * Update the specified catalog in storage.
     */
    public function update(Request $request, Catalog $catalog)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'required|numeric|gte:min_price',
            'type' => 'required|string',
            'features' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'max_price.gte' => 'Harga maksimum harus lebih besar dari atau sama dengan harga minimum.'
        ]);

        // Remove _method from validated data
        if (isset($validated['_method'])) {
            unset($validated['_method']);
        }

        // Convert min and max price to price array
        $priceArray = [$validated['min_price'], $validated['max_price']];

        // Remove individual price fields and add the array
        unset($validated['min_price'], $validated['max_price']);
        $validated['price'] = $priceArray;

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if it exists and is not the default
            if ($catalog->image && !str_contains($catalog->image, 'pernikahan.jpg')) {
                $oldPath = str_replace('/storage/', '', $catalog->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                    Log::info('Old catalog image deleted', ['path' => $oldPath]);
                }
            }

            $imagePath = $request->file('image')->store('catalog_images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
            Log::info('New catalog image uploaded', ['path' => $imagePath]);
        }

        $catalog->update($validated);

        Log::info('Catalog updated', [
            'id' => $catalog->id,
            'price_range' => $priceArray
        ]);

        return redirect()->route('admin.catalogs')->with('toast', [
            'type' => 'success',
            'message' => 'Catalog updated successfully!'
        ]);
    }

    /**
     * Remove the specified catalog from storage.
     */
    public function destroy(Catalog $catalog)
    {
        // Delete the image file if it's not the default
        if ($catalog->image && !str_contains($catalog->image, 'pernikahan.jpg')) {
            $imagePath = str_replace('/storage/', '', $catalog->image);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
                Log::info('Catalog image deleted', ['path' => $imagePath]);
            }
        }

        $catalog->delete();

        Log::info('Catalog deleted', ['id' => $catalog->id]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Catalog deleted successfully!'
        ]);
    }
}

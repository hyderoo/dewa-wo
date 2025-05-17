<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\PortfolioImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the portfolios.
     */
    public function index()
    {
        $portfolios = Portfolio::with('images')->get()->map(function ($portfolio) {
            return [
                'id' => $portfolio->id,
                'title' => $portfolio->title,
                'category' => $portfolio->category,
                'description' => $portfolio->description,
                'image' => $portfolio->image, // Keep for backward compatibility
                'images' => $portfolio->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'path' => $image->image_path,
                        'display_order' => $image->display_order,
                    ];
                }),
            ];
        });

        return Inertia::render('Admin/Portfolio/PortfolioManagement', [
            'portfolios' => $portfolios
        ]);
    }

    /**
     * Store a newly created portfolio in storage.
     */
    public function store(Request $request)
    {
        // Log the request for debugging
        Log::info('Portfolio store request', [
            'has_images' => $request->hasFile('images'),
            'all_data' => $request->all()
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'images' => 'required|array|min:1',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Create the portfolio
            $portfolio = Portfolio::create([
                'title' => $validated['title'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                // Keep the image field for backward compatibility
                'image' => null,
            ]);

            // Process all images
            if ($request->hasFile('images')) {
                $this->processPortfolioImages($portfolio, $request->file('images'));
            } else {
                throw new \Exception('No images were provided');
            }

            DB::commit();

            Log::info('Portfolio created', ['id' => $portfolio->id]);

            return redirect()->route('admin.portfolios')->with('toast', [
                'type' => 'success',
                'message' => 'Portfolio added successfully!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Portfolio creation failed', ['error' => $e->getMessage()]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to create portfolio: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Update the specified portfolio in storage.
     */
    public function update(Request $request, Portfolio $portfolio)
    {
        // Log the request for debugging
        Log::info('Portfolio update request', [
            'has_images' => $request->hasFile('images'),
            'portfolio_id' => $portfolio->id,
            'request_data' => $request->all()
        ]);

        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
        ];

        // Images are optional for updates
        if ($request->hasFile('images')) {
            $rules['images'] = 'array|min:1';
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif|max:2048';
        }

        $request->validate($rules);

        DB::beginTransaction();
        try {
            // Update the portfolio basic info
            $portfolio->update([
                'title' => $request->input('title', $portfolio->title),
                'category' => $request->input('category', $portfolio->category),
                'description' => $request->input('description', $portfolio->description),
            ]);

            // Process images if provided
            if ($request->hasFile('images')) {
                // Process new images
                $this->processPortfolioImages($portfolio, $request->file('images'));
            }

            // Handle image deletions if requested
            if ($request->has('delete_image_ids') && is_array($request->input('delete_image_ids'))) {
                $this->deletePortfolioImages($portfolio, $request->input('delete_image_ids'));
            }

            DB::commit();

            Log::info('Portfolio updated', ['id' => $portfolio->id]);

            return redirect()->route('admin.portfolios')->with('toast', [
                'type' => 'success',
                'message' => 'Portfolio updated successfully!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Portfolio update failed', ['error' => $e->getMessage()]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to update portfolio: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Remove the specified portfolio from storage.
     */
    public function destroy(Portfolio $portfolio)
    {
        try {
            // Delete all associated images
            foreach ($portfolio->images as $image) {
                $this->deleteImageFile($image->image_path);
            }

            // Also delete the legacy image if it exists
            if ($portfolio->image && !str_contains($portfolio->image, 'nikah.jpg')) {
                $this->deleteImageFile($portfolio->image);
            }

            $portfolio->delete();

            // Log successful deletion
            Log::info('Portfolio deleted', ['id' => $portfolio->id]);

            return redirect()->back()->with('toast', [
                'type' => 'success',
                'message' => 'Portfolio deleted successfully!'
            ]);
        } catch (\Exception $e) {
            Log::error('Portfolio deletion failed', ['error' => $e->getMessage()]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to delete portfolio: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Process and store portfolio images.
     */
    private function processPortfolioImages($portfolio, $images)
    {
        $order = $portfolio->images()->max('display_order') ?? 0;
        $firstImage = true;

        foreach ($images as $index => $image) {
            $imagePath = $image->store('portfolio_images', 'public');
            $fullPath = '/storage/' . $imagePath;

            $portfolioImage = new PortfolioImage([
                'image_path' => $fullPath,
                'display_order' => $order + $index + 1,
            ]);

            $portfolio->images()->save($portfolioImage);

            // Set the first image to display in the portfolio list view for backward compatibility
            if ($firstImage) {
                $portfolio->update(['image' => $fullPath]);
                $firstImage = false;
            }

            Log::info('Portfolio image added', [
                'portfolio_id' => $portfolio->id,
                'image_id' => $portfolioImage->id,
                'path' => $fullPath
            ]);
        }
    }

    /**
     * Delete portfolio images.
     */
    private function deletePortfolioImages($portfolio, $imageIds)
    {
        $images = $portfolio->images()->whereIn('id', $imageIds)->get();

        foreach ($images as $image) {
            $this->deleteImageFile($image->image_path);
            $image->delete();

            Log::info('Portfolio image deleted', [
                'portfolio_id' => $portfolio->id,
                'image_id' => $image->id
            ]);
        }

        // If the main display image was deleted, set a new one if available
        $mainImageDeleted = false;
        foreach ($images as $image) {
            if ($image->image_path === $portfolio->image) {
                $mainImageDeleted = true;
                break;
            }
        }

        if ($mainImageDeleted && $portfolio->images()->count() > 0) {
            $newMainImage = $portfolio->images()->first();
            $portfolio->update(['image' => $newMainImage->image_path]);

            Log::info('New main image set after deletion', [
                'portfolio_id' => $portfolio->id,
                'image_id' => $newMainImage->id
            ]);
        }
    }

    /**
     * Delete an image file from storage.
     */
    private function deleteImageFile($path)
    {
        if ($path && !str_contains($path, 'nikah.jpg')) {
            $storageFilePath = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($storageFilePath)) {
                Storage::disk('public')->delete($storageFilePath);
                Log::info('Image file deleted', ['path' => $storageFilePath]);
            }
        }
    }
}

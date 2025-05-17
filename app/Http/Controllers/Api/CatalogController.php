<?php

namespace App\Http\Controllers\Api;

use App\Models\Catalog;
use Illuminate\Http\Request;
use App\Models\CustomFeature;
use Illuminate\Support\Facades\Storage;

class CatalogController extends ApiController
{
    /**
     * Get all catalogs
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $catalogs = Catalog::all()->map(function ($catalog) {
            $catalog->image_url = $catalog->image ? Storage::url($catalog->image) : null;
            return $catalog;
        });

        return $this->successResponse($catalogs);
    }

    /**
     * Get a specific catalog by ID
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $catalog = Catalog::find($id);

        if (!$catalog) {
            return $this->notFoundResponse('Catalog not found');
        }

        $catalog->image_url = $catalog->image ? Storage::url($catalog->image) : null;

        return $this->successResponse($catalog);
    }

    /**
     * Get catalogs by type
     *
     * @param string $type
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByType($type)
    {
        $catalogs = Catalog::where('type', $type)->get()->map(function ($catalog) {
            $catalog->image_url = $catalog->image ? Storage::url($catalog->image) : null;
            return $catalog;
        });

        return $this->successResponse($catalogs);
    }

    /**
     * Get all custom features for the package builder
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomFeatures()
    {
        $features = CustomFeature::orderBy('name')->get();

        return $this->successResponse(['features' => $features]);
    }
}

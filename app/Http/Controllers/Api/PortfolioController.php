<?php

namespace App\Http\Controllers\Api;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends ApiController
{
    /**
     * Get all portfolios
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $portfolios = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])->get();

        // Transform the image paths to full URLs
        $portfolios = $portfolios->map(function ($portfolio) {
            $portfolio->images = $portfolio->images->map(function ($image) {
                $image->image_url = Storage::url($image->image_path);
                return $image;
            });
            return $portfolio;
        });

        return $this->successResponse($portfolios);
    }

    /**
     * Get latest portfolios with limit
     *
     * @param int $limit
     * @return \Illuminate\Http\JsonResponse
     */
    public function latest($limit = 6)
    {
        $portfolios = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])
            ->latest()
            ->take($limit)
            ->get();

        // Transform the image paths to full URLs
        $portfolios = $portfolios->map(function ($portfolio) {
            $portfolio->images = $portfolio->images->map(function ($image) {
                $image->image_url = Storage::url($image->image_path);
                return $image;
            });
            return $portfolio;
        });

        return $this->successResponse($portfolios);
    }

    /**
     * Get a specific portfolio
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $portfolio = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])->find($id);

        if (!$portfolio) {
            return $this->notFoundResponse('Portfolio not found');
        }

        // Transform the image paths to full URLs
        $portfolio->images = $portfolio->images->map(function ($image) {
            $image->image_url = Storage::url($image->image_path);
            return $image;
        });

        return $this->successResponse($portfolio);
    }

    /**
     * Get portfolios by category
     *
     * @param string $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByCategory($category)
    {
        $portfolios = Portfolio::with(['images' => function ($query) {
            $query->orderBy('display_order', 'asc');
        }])
            ->where('category', $category)
            ->get();

        // Transform the image paths to full URLs
        $portfolios = $portfolios->map(function ($portfolio) {
            $portfolio->images = $portfolio->images->map(function ($image) {
                $image->image_url = Storage::url($image->image_path);
                return $image;
            });
            return $portfolio;
        });

        return $this->successResponse($portfolios);
    }
}

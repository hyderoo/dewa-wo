<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'category',
        'description',
        'image', // Keep for backward compatibility
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [];

    /**
     * Get the images for the portfolio.
     */
    public function images()
    {
        return $this->hasMany(PortfolioImage::class);
    }

    /**
     * Get the first image for the portfolio.
     */
    public function firstImage()
    {
        return $this->hasOne(PortfolioImage::class)->orderBy('display_order', 'asc');
    }

    /**
     * Get the thumbnail image path.
     * Falls back to the legacy image field if no images are set.
     */
    public function getThumbnailAttribute()
    {
        $firstImage = $this->firstImage;

        if ($firstImage) {
            return $firstImage->image_path;
        }

        return $this->image;
    }
}

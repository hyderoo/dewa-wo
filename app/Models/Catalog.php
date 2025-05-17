<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalog extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'type',
        'image',
        'features',
    ];

    protected $appends = [
        'formatted_price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'features' => 'array',
        'price' => \App\Casts\ArrayOfIntegers::class,
    ];

    /**
     * Get the default image if none is set
     */
    public function getImageAttribute($value)
    {
        return $value ?: '/pernikahan.jpg';
    }

    /**
     * Format price range for display
     */
    public function getFormattedPriceAttribute()
    {
        if (!isset($this->price) || !is_array($this->price) || count($this->price) < 2) {
            return 'Harga tidak tersedia';
        }

        $minPrice = $this->price[0];
        $maxPrice = $this->price[1];

        // Format as Indonesian Rupiah
        $formattedMin = 'Rp ' . number_format($minPrice, 0, ',', '.');
        $formattedMax = 'Rp ' . number_format($maxPrice, 0, ',', '.');

        return $formattedMin . ' - ' . $formattedMax;
    }
}

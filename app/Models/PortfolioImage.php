<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'portfolio_id',
        'image_path',
        'display_order',
    ];

    /**
     * Get the portfolio that owns the image.
     */
    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }
}

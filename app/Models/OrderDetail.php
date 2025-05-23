<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'service_name',
        'description',
    ];

    /**
     * Get the order that owns the detail.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

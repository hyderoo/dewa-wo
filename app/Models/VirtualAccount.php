<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VirtualAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_code',
        'name',
        'account_number',
        'is_active',
        'description',
        'logo',
        'payment_instructions',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'payment_instructions' => 'array',
    ];

    /**
     * Scope a query to only include active virtual accounts.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

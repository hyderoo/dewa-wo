<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'catalog_id',
        'client_name',
        'event_date',
        'venue',
        'estimated_guests',
        'price',
        'original_price',
        'discount_percent',
        'discount_amount',
        'discount_reason',
        'down_payment_amount',
        'paid_amount',
        'status',
        'is_fully_paid',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'event_date' => 'date',
        'completed_at' => 'date',
        'cancelled_at' => 'date',
        'original_price' => 'decimal:2',
        'price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'down_payment_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'estimated_guests' => 'integer',
        'is_fully_paid' => 'boolean',
    ];

    protected $appends = [
        'formatted_price',
        'formatted_discount_amount',
        'formatted_discount_percent',
        'formatted_down_payment',
        'formatted_paid_amount',
        'formatted_remaining_amount',
        'remaining_amount',
        'payment_percentage',
        'has_reviewed',
        'included_services',
        'requires_down_payment',
        'down_payment_amount_value',
        'has_discount',
        'original_price',
        'formatted_original_price'
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the catalog that owns the order.
     */
    public function catalog(): BelongsTo
    {
        return $this->belongsTo(Catalog::class);
    }

    /**
     * Get the order details for the order.
     */
    public function details(): HasMany
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * Get the custom features for the order.
     */
    public function customFeatures(): HasMany
    {
        return $this->hasMany(OrderCustomFeature::class);
    }

    /**
     * Get the review for the order.
     */
    public function review(): HasOne
    {
        return $this->hasOne(OrderReview::class);
    }

    /**
     * Get the payments for the order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get the formatted discount amount.
     */
    public function getFormattedDiscountAmountAttribute(): string
    {
        return $this->discount_amount ? 'Rp ' . number_format($this->discount_amount, 0, ',', '.') : '-';
    }

    /**
     * Get the formatted discount percentage.
     */
    public function getFormattedDiscountPercentAttribute(): string
    {
        return $this->discount_percent ? number_format($this->discount_percent, 0) . '%' : '-';
    }

    /**
     * Get the formatted down payment amount.
     */
    public function getFormattedDownPaymentAttribute(): string
    {
        if ($this->down_payment_amount) {
            return 'Rp ' . number_format($this->down_payment_amount, 0, ',', '.');
        }

        // Default to 30% if not specifically set
        $downPayment = $this->price * 0.3;
        return 'Rp ' . number_format($downPayment, 0, ',', '.');
    }

    /**
     * Get the formatted paid amount.
     */
    public function getFormattedPaidAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->paid_amount ?? 0, 0, ',', '.');
    }

    /**
     * Get the formatted remaining amount.
     */
    public function getFormattedRemainingAmountAttribute(): string
    {
        $remaining = $this->price - ($this->paid_amount ?? 0);
        return 'Rp ' . number_format(max(0, $remaining), 0, ',', '.');
    }

    /**
     * Get the remaining amount value.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->price - ($this->paid_amount ?? 0));
    }

    /**
     * Get the payment percentage.
     */
    public function getPaymentPercentageAttribute(): int
    {
        if ($this->price <= 0) {
            return 0;
        }

        $percentage = (($this->paid_amount ?? 0) / $this->price) * 100;
        return min(100, (int)$percentage);
    }

    /**
     * Check if the order has a review.
     */
    public function getHasReviewedAttribute(): bool
    {
        return $this->review()->exists();
    }

    /**
     * Get the included services from order details.
     */
    public function getIncludedServicesAttribute(): array
    {
        return $this->details()->pluck('service_name')->toArray();
    }

    /**
     * Check if the order requires a down payment.
     */
    public function getRequiresDownPaymentAttribute(): bool
    {
        return $this->status === 'pending_payment' && ($this->paid_amount ?? 0) <= 0;
    }

    /**
     * Get the down payment amount value.
     */
    public function getDownPaymentAmountValueAttribute(): float
    {
        if ($this->down_payment_amount) {
            return $this->down_payment_amount;
        }

        // Default to 30% if not specifically set
        return $this->price * 0.3;
    }

    /**
     * Check if order has discount
     */
    public function getHasDiscountAttribute(): bool
    {
        return !is_null($this->discount_amount) && $this->discount_amount > 0;
    }

    /**
     * Get original price before discount
     */
    public function getOriginalPriceAttribute(): float
    {
        if ($this->hasDiscount) {
            return $this->price + $this->discount_amount;
        }

        return $this->price ?? 0;
    }

    /**
     * Get formatted original price
     */
    public function getFormattedOriginalPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->originalPrice, 0, ',', '.');
    }
}

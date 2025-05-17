<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'payment_type',
        'payment_method',
        'payment_data',
        'bank_code',
        'amount',
        'payment_proof',
        'status',
        'note',
        'verified_by',
        'verified_at',
        'expiry_time',
        'va_number',
        'transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
        'expiry_time' => 'datetime',
        'payment_method' => 'string',
    ];

    public const METHOD_BANK_TRANSFER = 'bank_transfer';
    public const METHOD_VIRTUAL_ACCOUNT = 'virtual_account';
    public const METHOD_CASH = 'cash';

    public const VALID_METHODS = [
        self::METHOD_BANK_TRANSFER,
        self::METHOD_VIRTUAL_ACCOUNT,
        self::METHOD_CASH,
    ];


    /**
     * Get the order that the payment belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who made the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who verified the payment.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get formatted amount.
     */
    public function getFormattedAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    /**
     * Get payment status display.
     */
    public function getStatusDisplayAttribute(): string
    {
        return ucfirst($this->status);
    }

    /**
     * Get payment type display.
     */
    public function getPaymentTypeDisplayAttribute(): string
    {
        return match ($this->payment_type) {
            'down_payment' => 'Uang Muka',
            'installment' => 'Cicilan',
            'full_payment' => 'Pembayaran Penuh',
            default => ucfirst($this->payment_type),
        };
    }

    /**
     * Get payment method display.
     */
    public function getPaymentMethodDisplayAttribute(): string
    {
        return match ($this->payment_method) {
            'bank_transfer' => 'Transfer Bank',
            'credit_card' => 'Kartu Kredit',
            'e_wallet' => 'E-Wallet',
            'virtual_account' => 'Virtual Account',
            'cash' => 'Tunai',
            default => ucfirst($this->payment_method),
        };
    }
}

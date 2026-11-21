<?php

namespace App\Models\Order;

use App\Enums\PaymentMethodEnum;
use App\Enums\PaymentStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

#[Fillable([
    'order_id',
    'amount',
    'status',
    'method',
    'transaction_id',
    'reference_id',
    'paid_at',
    'refunded_at',
    'failure_reason',
])]
class Payment extends Model
{
    #[Override]
    public function casts(): array
    {
        return [
            'order_id' => 'integer',
            'amount' => 'integer',
            'status' => PaymentStatusEnum::class,
            'method' => PaymentMethodEnum::class,
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

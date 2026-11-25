<?php

namespace App\Models\Order;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\User;
use Database\Factories\Order\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Override;

#[Fillable([
    'order_number',
    'total_amount',
    'order_status',
    'payment_status',
    'tracking_code',
    'shipping_address',
    'paid_at',
    'shipped_at',
    'delivered_at',
    'cancelled_at',
    'cancellation_reason',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    #[Override]
    public function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'order_status' => OrderStatusEnum::class,
            'payment_status' => PaymentStatusEnum::class,
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    #[Scope]
    public function search(
        Builder $builder,
        ?string $orderStatus,
        ?string $dateFrom,
        ?string $dateTo
    ): Builder {
        return $builder
            ->when($orderStatus, fn ($query, string $value) => $query->where('order_status', $value))
            ->when($dateFrom, fn ($query, string $value) => $query->whereDate('created_at', '>=', $value))
            ->when($dateTo, fn ($query, string $value) => $query->whereDate('created_at', '<=', $value));
    }
}

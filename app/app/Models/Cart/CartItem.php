<?php

namespace App\Models\Cart;

use App\Models\Product\Product;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

#[Fillable([
    'product_id',
    'quantity',
])]
class CartItem extends Model
{
    #[Override]
    public function casts(): array
    {
        return [
            'cart_id' => 'integer',
            'quantity' => 'integer',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

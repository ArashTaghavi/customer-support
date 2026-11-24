<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CartService
{
    public function index(User $user): ?Collection
    {
        return $user->cartItems()
            ->with(['product'])
            ->get();
    }

    public function add(User $user, int $productId): void
    {
        $user->cart()
            ->firstOrCreate()
            ->cartItems()
            ->incrementOrCreate(
                ['product_id' => $productId],
                'quantity',
            );
    }

    public function remove(User $user, int $productId): void
    {
        $cartItem = $user->cartItems()
            ->where('product_id', $productId)
            ->first();

        if (! $cartItem) {
            return;
        }

        $cartItem->quantity > 1
        ? $cartItem->decrement('quantity')
        : $cartItem->delete();
    }
}

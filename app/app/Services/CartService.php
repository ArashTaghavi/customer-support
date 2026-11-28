<?php

namespace App\Services;

use App\Models\Product\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        DB::transaction(function () use ($user, $productId): void {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);
            $quantity = $user->cartItems()->where('product_id', $productId)->value('quantity') ?? 0;
            if ($quantity >= $product->stock) {
                throw ValidationException::withMessages([
                    'cart' => 'The requested quantity exceeds available stock.',
                ]);
            }
            $user->cart()
                ->firstOrCreate()
                ->cartItems()
                ->incrementOrCreate(
                    ['product_id' => $productId],
                    'quantity',
                );
        });
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

<?php

namespace App\Http\Controllers;

use App\Http\Resources\Cart\CartResource;
use App\Models\Product\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = $request->cart
            ?->cartItems()
            ->with(['product'])
            ->get();

        return CartResource::collection($cartItems);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        $cart = $request->user()->cart()->firstOrCreate();

        $cartItem = $cart->cartItems()->firstOrCreate([
            'product_id' => $product->id,
        ]);

        if (! $cartItem->wasRecentlyCreated) {
            $cartItem->increment('quantity');
        }

        return back();
    }

    public function remove(Request $request, Product $product): RedirectResponse
    {
        $cartItem = $request->user()
            ->cart
            ?->cartItems()
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem->quantity > 1) {
            $cartItem->decrement('quantity');
        } else {
            $cartItem->delete();
        }

        return back();
    }
}

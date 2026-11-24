<?php

namespace App\Http\Controllers;

use App\Http\Resources\Cart\CartResource;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $cartItems = $this->cartService->index(user: $request->user());

        return CartResource::collection($cartItems);
    }

    public function add(Request $request, int $productId): RedirectResponse
    {
        $this->cartService->add(user: $request->user(), productId: $productId);

        return back();
    }

    public function remove(Request $request, int $productId): RedirectResponse
    {
        $this->cartService->remove(user: $request->user(), productId: $productId);

        return back();
    }
}

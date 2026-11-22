<?php

namespace App\Http\Controllers;

use App\Http\Resources\Cart\CartResource;
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
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\Order\OrderResource as OrderOrderResource;
use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatResponseController extends Controller
{
    public function orders(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user(), 401);

        $validated = $request->validate([
            'ids' => ['present', 'array'],
            'ids.*' => ['required', 'integer', 'min:1'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $orders = $request->user()->orders()
            ->with(['orderItems.product.productCategory', 'payments'])
            ->whereIn('id', $validated['ids'])
            ->orderBy('id')
            ->paginate(5)
            ->withQueryString();

        return OrderOrderResource::collection($orders);
    }

    public function products(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'ids' => ['present', 'array'],
            'ids.*' => ['required', 'integer', 'min:1'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $products = Product::whereIn('id', $validated['ids'])
            ->orderBy('id')
            ->paginate(5)
            ->withQueryString();

        return ProductResource::collection($products);
    }
}

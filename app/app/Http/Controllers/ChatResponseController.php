<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatResponseRequest;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatResponseController extends Controller
{
    public function orders(ChatResponseRequest $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with([
                'orderItems' => [
                    'product' => [
                        'productCategory',
                    ],
                ], 'payments'])
            ->whereIn('id', $request->array('ids'))
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function products(ChatResponseRequest $request): AnonymousResourceCollection
    {

        $products = Product::whereIn('id', $request->array('ids'))
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return ProductResource::collection($products);
    }
}

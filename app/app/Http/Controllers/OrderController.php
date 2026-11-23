<?php

namespace App\Http\Controllers;

use App\Http\Resources\Order\OrderResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);

        $orders = $request->user()->orders()
            ->with(['orderItems.product.productCategory', 'payments'])
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('app/orders/index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }
}

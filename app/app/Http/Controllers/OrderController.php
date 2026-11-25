<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Http\Resources\Order\OrderResource;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(OrderRequest $request): Response
    {
        $orders = $request->user()->orders()
            ->with([
                'orderItems' => [
                    'product' => [
                        'productCategory',
                    ],
                ],
                'payments',
            ])
            ->search(
                orderStatus: $request->input('status'),
                dateFrom: $request->input('date_from'),
                dateTo: $request->input('date_to')
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('app/orders/index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }
}

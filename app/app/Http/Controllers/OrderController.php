<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Resources\Order\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'status' => ['nullable', Rule::enum(OrderStatusEnum::class)],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', ...(! empty($request->input('date_from')) ? ['after_or_equal:date_from'] : [])],
        ]);

        $orders = $request->user()->orders()
            ->with(['orderItems.product.productCategory', 'payments'])
            ->when(isset($validated['status']), fn ($query) => $query->where('order_status', $validated['status']))
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $validated['date_to']))
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('app/orders/index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }
}

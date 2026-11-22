<?php

namespace App\Http\Middleware;

use App\Models\Cart\CartItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'conversations' => $request->user()
                ?->conversations()
                ->latest()
                ->get() ?? [],
            'cart' => fn () => $request->user()
                ? CartItem::query()
                    ->with('product')
                    ->whereRelation('cart', 'user_id', $request->user()->id)
                    ->latest()
                    ->get()
                    ->map(fn (CartItem $cartItem) => [
                        'id' => $cartItem->id,
                        'product' => [
                            'id' => $cartItem->product_id,
                            'title' => $cartItem->product->title,
                            'price' => $cartItem->product->price,
                            'image' => $cartItem->product->image_url,
                        ],
                        'quantity' => $cartItem->quantity,
                    ])
                : [],
        ];
    }
}

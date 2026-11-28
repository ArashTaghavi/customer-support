<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\Product\ProductCategoryResource;
use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(ProductRequest $request): Response
    {
        $products = Product::query()
            ->with('productCategory')
            ->search(categoryId: $request->input('category'), sort: $request->input('sort'))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $showroomCategories = ProductCategory::query()
            ->whereIn('showroom_slot', [...ProductCategory::SHOWROOM_SLOTS, 'headphone'])
            ->orWhere('title', 'Gaming')
            ->with(['products' => fn (HasMany $query) => $query->orderByDesc('id')])
            ->get();
        $legacyLayout = $showroomCategories->contains('showroom_slot', 'headphone');
        $tables = array_map(function (string $slot) use ($showroomCategories, $legacyLayout): array {
            $category = $showroomCategories->firstWhere('showroom_slot', $slot);
            if (! $category && $legacyLayout) {
                $category = match ($slot) {
                    'accessories' => $showroomCategories->firstWhere('showroom_slot', 'headphone'),
                    'gaming' => $showroomCategories->first(fn (ProductCategory $category): bool => $category->title === 'Gaming' && $category->showroom_slot === null),
                    default => null,
                };
            }

            $models = $category ? $category->products
                ->filter(fn (Product $product): bool => trim((string) $product->model_file) !== '')
                ->sort(fn (Product $first, Product $second): int => (($first->showroom_order ?? PHP_INT_MAX) <=> ($second->showroom_order ?? PHP_INT_MAX))
                    ?: ($second->id <=> $first->id))
                ->values() : collect();

            return [
                'slot' => $slot,
                'category' => $category ? array_replace(ProductCategoryResource::make($category)->resolve(), ['showroom_slot' => $slot]) : null,
                'products' => ProductResource::collection($models)->resolve(),
                'catalog_products' => $category ? ProductResource::collection($category->products->filter(fn (Product $product): bool => trim((string) $product->image) !== '')->values())->resolve() : [],
            ];
        }, ProductCategory::SHOWROOM_SLOTS);

        return Inertia::render('site/shop/index', [
            'showroomTables' => $tables,
            'categories' => ProductCategoryResource::collection(ProductCategory::orderBy('title')->get()),
            'products' => ProductResource::collection($products),
            'otp' => $request->user() ? null : $request->session()->get('otp.challenge'),
            'resendAt' => max($request->session()->get('otp.challenge.resend_at', 0), $request->session()->get('otp.resend_at', 0)),
            'category' => $request->filled('category') ? $request->integer('category') : null,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\Product\ProductCategoryResource;
use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'category' => ['nullable', 'integer', 'min:1'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);
        $category = isset($validated['category'])
            ? ProductCategory::findOrFail($validated['category'])
            : null;

        $products = Product::query()
            ->with('productCategory')
            ->when($category, fn (Builder $query): Builder => $query->where('product_category_id', $category->id))
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('app/shop/index', [
            'categories' => ProductCategoryResource::collection(ProductCategory::orderBy('title')->get()),
            'products' => ProductResource::collection($products),
            'category' => $category?->id,
        ]);
    }
}

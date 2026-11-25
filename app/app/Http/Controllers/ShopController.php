<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\Product\ProductCategoryResource;
use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
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

        return Inertia::render('site/shop/index', [
            'categories' => ProductCategoryResource::collection(ProductCategory::orderBy('title')->get()),
            'products' => ProductResource::collection($products),
            'category' => $request->filled('category') ? $request->integer('category') : null,
        ]);
    }
}

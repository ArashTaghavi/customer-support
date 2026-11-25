<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CatalogIndexRequest;
use App\Http\Requests\Admin\StoreProductCategoryRequest;
use App\Http\Requests\Admin\UpdateProductCategoryRequest;
use App\Http\Resources\Admin\ProductCategoryResource;
use App\Models\Product\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(CatalogIndexRequest $request): Response
    {
        $sort = match ($request->input('sort')) {
            'title' => 'title', 'product_count' => 'products_count', default => 'id'
        };
        $categories = ProductCategory::withCount('products')
            ->when($request->filled('q'), fn ($query) => $query->where('title', 'like', '%'.$request->input('q').'%'))
            ->orderBy($sort, ($request->input('direction') ?? 'desc'))->orderByDesc('id')->paginate(12)->withQueryString();

        return Inertia::render('admin/product_categories/index', ['categories' => ProductCategoryResource::collection($categories), 'filters' => $request->only(['q', 'sort', 'direction']), 'notice' => $request->session()->get('success')]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/product_categories/form', ['category' => null]);
    }

    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        ProductCategory::create($request->validated());

        return to_route('admin.product-categories.index')->with('success', 'Category created.');
    }

    public function edit(ProductCategory $productCategory): Response
    {
        return Inertia::render('admin/product_categories/form', ['category' => ProductCategoryResource::make($productCategory->loadCount('products'))->resolve()]);
    }

    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        return to_route('admin.product-categories.index')->with('success', 'Category updated.');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        DB::transaction(function () use ($productCategory): void {
            $category = ProductCategory::whereKey($productCategory->id)->lockForUpdate()->firstOrFail();
            if ($category->products()->exists()) {
                throw ValidationException::withMessages(['delete' => 'Move or delete the products in this category before deleting it.']);
            }
            $category->update(['showroom_slot' => null]);
            $category->delete();
        });

        return to_route('admin.product-categories.index')->with('success', 'Category deleted.');
    }
}

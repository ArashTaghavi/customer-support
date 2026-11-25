<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CatalogIndexRequest;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\Admin\ProductCategoryResource;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(public ProductService $service) {}

    public function index(CatalogIndexRequest $request): Response
    {
        $sort = in_array($request->input('sort'), ['title', 'price', 'stock']) ? $request->input('sort') : 'id';
        $products = Product::with('productCategory')
            ->when($request->filled('q'), fn ($query) => $query->where('title', 'like', '%'.$request->input('q').'%'))
            ->when($request->filled('category'), fn ($query) => $query->where('product_category_id', $request->integer('category')))
            ->orderBy($sort, ($request->input('direction') ?? 'desc'))->orderByDesc('id')->paginate(12)->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => ProductResource::collection($products),
            'categories' => ProductCategoryResource::collection(ProductCategory::withCount('products')->orderBy('title')->get()),
            'filters' => $request->only(['q', 'category', 'sort', 'direction']),
            'modelCount' => Product::whereNotNull('model_file')->count(),
            'notice' => $request->session()->get('success'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', ['product' => null, 'categories' => ProductCategoryResource::collection(ProductCategory::withCount('products')->orderBy('title')->get())]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->service->save($request->validated());

        return to_route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', ['product' => ProductResource::make($product->load('productCategory'))->resolve(), 'categories' => ProductCategoryResource::collection(ProductCategory::withCount('products')->orderBy('title')->get())]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->service->save($request->validated(), $product);

        return to_route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->service->delete($product);

        return to_route('admin.products.index')->with('success', 'Product deleted.');
    }
}

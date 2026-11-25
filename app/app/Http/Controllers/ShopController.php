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
            ->whereIn('showroom_slot', ProductCategory::SHOWROOM_SLOTS)
            ->with(['products' => fn (HasMany $query) => $query->whereNotNull('model_file')->where('model_file', '!=', '')->orderByDesc('id')])
            ->get()->keyBy('showroom_slot');
        $tables = array_map(function (string $slot) use ($showroomCategories): array {
            $category = $showroomCategories->get($slot);

            return [
                'slot' => $slot,
                'category' => $category ? ProductCategoryResource::make($category)->resolve() : null,
                'products' => $category ? ProductResource::collection($category->products)->resolve() : [],
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

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/index', [
            'stats' => [
                'products' => Product::count(),
                'categories' => ProductCategory::count(),
                'models' => Product::whereNotNull('model_file')->where('model_file', '!=', '')->count(),
            ],
            'recentProducts' => ProductResource::collection(Product::with('productCategory')->latest('id')->limit(6)->get()),
        ]);
    }
}

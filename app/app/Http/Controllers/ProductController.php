<?php

namespace App\Http\Controllers;

use App\Http\Resources\Product\ProductResource;
use App\Models\Product\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product): Response
    {
        return Inertia::render('app/products/show', [
            'product' => ProductResource::make($product->load('productCategory')),
        ]);
    }
}

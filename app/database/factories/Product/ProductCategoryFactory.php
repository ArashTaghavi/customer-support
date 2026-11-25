<?php

namespace Database\Factories\Product;

use App\Models\Product\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductCategory> */
class ProductCategoryFactory extends Factory
{
    protected $model = ProductCategory::class;

    public function definition(): array
    {
        return ['title' => fake()->unique()->words(3, true), 'product_count' => 0];
    }
}

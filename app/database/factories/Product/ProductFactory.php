<?php

namespace Database\Factories\Product;

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return ['title' => fake()->words(3, true), 'description' => fake()->sentence(), 'price' => fake()->numberBetween(0, 1000000), 'stock' => 10, 'product_category_id' => ProductCategory::factory(), 'image' => null];
    }
}

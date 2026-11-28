<?php

namespace Database\Seeders;

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Phone' => ['aliases' => ['Mobile and Tablets', 'phone'], 'slot' => 'phone'],
            'Laptop' => ['aliases' => ['Laptop and Computers', 'laptop'], 'slot' => 'laptop'],
            'Gaming' => ['aliases' => ['Gaming & Consoles'], 'slot' => 'gaming'],
            'Accessories' => ['aliases' => ['Digital Accessories', 'headphone'], 'slot' => 'accessories'],
        ];

        DB::transaction(function () use ($categories): void {
            foreach ($categories as $title => $definition) {
                $matches = ProductCategory::withTrashed()
                    ->where(function (Builder $query) use ($title, $definition): void {
                        $query->whereIn('title', [$title, ...$definition['aliases']]);
                        if ($definition['slot'] !== null) {
                            $query->orWhere('showroom_slot', $definition['slot']);
                            if ($title === 'Accessories') {
                                $query->orWhere('showroom_slot', 'headphone');
                            }
                        }
                    })->orderBy('id')->get();
                $category = $matches->firstWhere('title', $title) ?? $matches->first() ?? new ProductCategory;
                foreach ($matches as $duplicate) {
                    if ($duplicate->is($category)) {
                        continue;
                    }
                    $duplicate->showroom_slot = null;
                    $duplicate->save();
                }
                $category->fill(['title' => $title, 'showroom_slot' => $definition['slot']]);
                $category->deleted_at = null;
                $category->save();
                foreach ($matches as $duplicate) {
                    if ($duplicate->is($category)) {
                        continue;
                    }
                    Product::withTrashed()->where('product_category_id', $duplicate->id)->update(['product_category_id' => $category->id]);
                    $duplicate->product_count = 0;
                    $duplicate->save();
                    if (! $duplicate->trashed()) {
                        $duplicate->delete();
                    }
                }
                $category->update(['product_count' => $category->products()->count()]);
            }
        });
    }
}

<?php

namespace Database\Seeders;

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ProductModelSeeder extends Seeder
{
    public function run(): void
    {
        $models = array_values(array_filter(
            File::json(public_path('models/showroom/manifest.json'), JSON_THROW_ON_ERROR),
            fn (array $model): bool => isset($model['category'], $model['title']),
        ));
        foreach ($models as $model) {
            $source = public_path('models/showroom/'.$model['file']);
            if (basename($model['file']) !== $model['file'] || ! File::isFile($source)) {
                throw new RuntimeException('Missing showroom model: '.$model['file']);
            }
            if (hash_file('sha256', $source) !== $model['sha256']) {
                throw new RuntimeException('Invalid showroom model checksum: '.$model['file']);
            }
        }

        $this->call(ProductCategorySeeder::class);

        DB::transaction(function () use ($models): void {
            $categories = ProductCategory::query()->get()->keyBy('title');
            $affectedCategories = [];
            foreach ($models as $model) {
                $category = $categories->get($model['category']);
                if (! $category) {
                    throw new RuntimeException('Missing showroom category: '.$model['category']);
                }
                $path = Product::uploadPath.'/models/showroom/'.$model['file'];
                if (! Storage::disk('public')->put($path, File::get(public_path('models/showroom/'.$model['file'])))) {
                    throw new RuntimeException('Failed to store showroom model: '.$model['file']);
                }
                $product = Product::withTrashed()->firstOrNew(['model_file' => $path]);
                if (! $product->exists) {
                    $product->fill([
                        'title' => $model['title'],
                        'description' => $model['copyright'],
                        'price' => 0,
                        'stock' => 1,
                        'product_category_id' => $category->id,
                    ]);
                }
                if ($product->product_category_id) {
                    $affectedCategories[] = $product->product_category_id;
                }
                $product->product_category_id = $category->id;
                $affectedCategories[] = $category->id;
                $product->deleted_at = null;
                $product->save();
            }
            foreach (array_unique($affectedCategories) as $id) {
                ProductCategory::whereKey($id)->update(['product_count' => Product::where('product_category_id', $id)->count()]);
            }
        });
    }
}

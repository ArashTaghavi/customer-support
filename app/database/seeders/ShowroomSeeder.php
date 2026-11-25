<?php

namespace Database\Seeders;

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ShowroomSeeder extends Seeder
{
    private const MODELS = [
        'phone' => ['smartphone' => 'Smartphone', 'camera-phone' => 'Camera phone', 'foldable-phone' => 'Foldable phone'],
        'laptop' => ['gaming-laptop' => 'Gaming laptop', 'thin-laptop' => 'Thin laptop', 'business-laptop' => 'Business laptop'],
        'headphone' => ['over-ear-headphones' => 'Over-ear headphones', 'studio-headphones' => 'Studio headphones', 'gaming-headset' => 'Gaming headset', 'wireless-earbuds' => 'Wireless earbuds'],
    ];

    public function run(): void
    {
        foreach (self::MODELS as $models) {
            foreach ($models as $name => $title) {
                if (! File::exists(public_path('models/showroom/'.$name.'.glb'))) {
                    throw new RuntimeException('Missing showroom model: '.$name.'.glb');
                }
            }
        }
        DB::transaction(function (): void {
            $affectedCategories = [];
            foreach (self::MODELS as $slot => $models) {
                $category = ProductCategory::where('showroom_slot', $slot)->first()
                    ?? ProductCategory::withTrashed()->firstOrNew(['title' => $slot]);
                $category->showroom_slot = $slot;
                $category->deleted_at = null;
                $category->save();
                foreach ($models as $name => $title) {
                    $path = Product::uploadPath.'/models/showroom/'.$name.'.glb';
                    if (! Storage::disk('public')->put($path, File::get(public_path('models/showroom/'.$name.'.glb')))) {
                        throw new RuntimeException('Failed to store showroom model: '.$name.'.glb');
                    }
                    $product = Product::withTrashed()->firstOrNew(['model_file' => $path]);
                    if (! $product->exists) {
                        $product->fill(['title' => $title, 'description' => '3D product model by vinish.dev, licensed under CC BY 4.0.', 'price' => 0, 'stock' => 1, 'product_category_id' => $category->id]);
                    }
                    if ($product->product_category_id) {
                        $affectedCategories[] = $product->product_category_id;
                    }
                    $product->product_category_id = $category->id;
                    $affectedCategories[] = $category->id;
                    $product->deleted_at = null;
                    $product->save();
                }

            }
            foreach (array_unique($affectedCategories) as $id) {
                ProductCategory::whereKey($id)->update(['product_count' => Product::where('product_category_id', $id)->count()]);
            }
        });
    }
}

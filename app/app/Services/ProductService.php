<?php

namespace App\Services;

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class ProductService
{
    public function __construct(public FileUploadService $files) {}

    /** @param array<string, mixed> $data */
    public function save(array $data, ?Product $product = null): Product
    {
        $product ??= new Product;
        $oldImage = $product->image;
        $oldModel = $product->model_file;
        $newFiles = [];
        $oldCategory = $product->product_category_id;
        $attributes = array_intersect_key($data, array_flip(['title', 'description', 'price', 'stock', 'showroom_order', 'product_category_id']));
        $attributes['image'] = ! empty($data['remove_image']) ? null : $oldImage;
        $attributes['model_file'] = ! empty($data['remove_model_file']) ? null : $oldModel;
        try {
            if (($data['image'] ?? null) instanceof UploadedFile) {
                $attributes['image'] = $this->files->upload($data['image'], Product::uploadPath.'/images');
                $newFiles[] = $attributes['image'];
            }
            if (($data['model_file'] ?? null) instanceof UploadedFile) {
                $path = Storage::disk('public')->putFileAs(Product::uploadPath.'/models', $data['model_file'], Str::uuid().'.glb');
                if ($path === false) {
                    throw new RuntimeException('Failed to upload the 3D model.');
                }
                $attributes['model_file'] = $path;
                $newFiles[] = $path;
            }
            DB::transaction(function () use ($product, $attributes, $oldCategory): void {
                $ids = array_values(array_unique(array_filter([$oldCategory, $attributes['product_category_id']])));
                $categories = ProductCategory::whereKey($ids)->orderBy('id')->lockForUpdate()->get();
                if (! $categories->contains('id', $attributes['product_category_id'])) {
                    throw ValidationException::withMessages(['product_category_id' => 'Choose an available category.']);
                }
                $product->fill($attributes)->save();
                $this->refreshCounts($ids);
            });
        } catch (Throwable $error) {
            foreach ($newFiles as $path) {
                $this->files->delete($path);
            }
            throw $error;
        }
        foreach (['image' => $oldImage, 'model_file' => $oldModel] as $field => $path) {
            if ($path && $path !== $attributes[$field] && (str_starts_with($path, Product::uploadPath.'/images/') || str_starts_with($path, Product::uploadPath.'/models/'))) {
                $this->files->delete($path);
            }
        }

        return $product;
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product): void {
            ProductCategory::whereKey($product->product_category_id)->lockForUpdate()->firstOrFail();
            $product->delete();
            $this->refreshCounts([$product->product_category_id]);
        });
    }

    /** @param array<int, int|string> $ids */
    private function refreshCounts(array $ids): void
    {
        foreach ($ids as $id) {
            ProductCategory::whereKey($id)->update(['product_count' => Product::where('product_category_id', $id)->count()]);
        }
    }
}

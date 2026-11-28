<?php

namespace App\Http\Resources\Admin;

use App\Models\Product\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'title' => $this->title, 'description' => $this->description,
            'price' => $this->price, 'stock' => $this->stock,
            'showroom_order' => $this->showroom_order,
            'product_category_id' => $this->product_category_id,
            'image_url' => $this->image ? $this->image_url : null,
            'model_url' => $this->model_url,
            'product_category' => ProductCategoryResource::make($this->whenLoaded('productCategory')),
            'created_at' => $this->created_at?->toIso8601String(), 'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

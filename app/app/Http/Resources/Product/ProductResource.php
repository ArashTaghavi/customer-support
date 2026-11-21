<?php

namespace App\Http\Resources\Product;

use App\Models\Product\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'product_category_id' => $this->product_category_id,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'product_category' => ProductCategoryResource::make($this->whenLoaded('productCategory')),
        ];
    }
}

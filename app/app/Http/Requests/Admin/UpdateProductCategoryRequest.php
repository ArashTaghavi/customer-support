<?php

namespace App\Http\Requests\Admin;

use App\Models\Product\ProductCategory;
use Illuminate\Validation\Rule;

class UpdateProductCategoryRequest extends StoreProductCategoryRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', Rule::unique(ProductCategory::class)->ignore($this->route('productCategory'))],
            'showroom_slot' => ['nullable', Rule::in(ProductCategory::SHOWROOM_SLOTS), Rule::unique(ProductCategory::class, 'showroom_slot')->ignore($this->route('productCategory'))],
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use App\Models\Product\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('title'))) {
            $this->merge(['title' => trim($this->input('title'))]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', Rule::unique(ProductCategory::class)],
            'showroom_slot' => ['nullable', Rule::in(ProductCategory::SHOWROOM_SLOTS), Rule::unique(ProductCategory::class, 'showroom_slot')],
        ];
    }
}

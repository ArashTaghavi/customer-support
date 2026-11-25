<?php

namespace App\Http\Requests\Admin;

use App\Rules\GlbFile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:16000'],
            'price' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'stock' => ['required', 'integer', 'min:0', 'max:65535'],
            'product_category_id' => ['required', 'integer', Rule::exists('product_categories', 'id')->whereNull('deleted_at')],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'model_file' => ['nullable', 'file', 'max:51200', new GlbFile],
            'remove_image' => ['sometimes', 'boolean'],
            'remove_model_file' => ['sometimes', 'boolean'],
        ];
    }
}

<?php

namespace App\Models\Product;

use App\Models\Cart\CartItem;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Override;

#[Fillable([
    'title',
    'description',
    'price',
    'stock',
    'product_category_id',
    'image',
    'model_file',
])]
class Product extends Model
{
    use HasFactory, SoftDeletes;

    public const uploadPath = 'products';

    #[Override]
    public function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'product_category_id' => 'integer',
        ];
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => asset("{$this->image}"),
        );
    }

    protected function modelUrl(): Attribute
    {
        return Attribute::make(get: fn (): ?string => $this->model_file ? asset($this->model_file) : null);
    }

    #[Scope]
    public function search(Builder $builder, ?int $categoryId, ?string $sort): Builder
    {
        return $builder->when($categoryId, fn (Builder $query, int $value): Builder => $query->where('product_category_id', $value))
            ->when($sort, fn (Builder $query, $value): Builder => $query->orderBy('price', $value == 'price_desc' ? 'desc' : 'asc'));
    }
}

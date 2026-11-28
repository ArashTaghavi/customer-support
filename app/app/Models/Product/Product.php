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
    'showroom_order',
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
            'showroom_order' => 'integer',
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
        return Attribute::make(get: function (): ?string {
            if (! $this->model_file) {
                return null;
            }
            if (str_starts_with($this->model_file, self::uploadPath.'/models/showroom/')) {
                $bundledModel = 'models/showroom/'.basename($this->model_file);
                if (is_file(public_path($bundledModel))) {
                    return asset($bundledModel);
                }
            }

            return asset($this->model_file);
        });
    }

    #[Scope]
    public function search(Builder $builder, ?int $categoryId, ?string $sort): Builder
    {
        return $builder->when($categoryId, fn (Builder $query, int $value): Builder => $query->where('product_category_id', $value))
            ->when($sort, fn (Builder $query, $value): Builder => $query->orderBy('price', $value == 'price_desc' ? 'desc' : 'asc'));
    }
}

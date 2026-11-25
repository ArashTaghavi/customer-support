<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Override;

#[Fillable([
    'title',
    'showroom_slot',
    'product_count',
])]
class ProductCategory extends Model
{
    use HasFactory, SoftDeletes;

    public const SHOWROOM_SLOTS = ['phone', 'laptop', 'headphone'];

    #[Override]
    public function casts(): array
    {
        return [
            'product_count' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'code',
    'expires_at',
    'used_at',
    'attempts',
])]
// #[Hidden(['code'])]
class Otp extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // 'code'=>'hashed',
            'user_id' => 'integer',
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->whereNull('used_at')
            ->where('expires_at', '>', now());
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activeCode(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => ! $this->is_used && ! $this->is_expired
                ? $this->code
                : null
        );
    }

    public function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => ! $this->expires_at->isFuture()
        );
    }

    public function isUsed(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->used_at !== null
        );
    }
}

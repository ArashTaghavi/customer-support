<?php

namespace App\Models\Policy;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class PolicyCategory extends Model
{
    public function policies(): HasMany
    {
        return $this->hasMany(Policy::class);
    }
}

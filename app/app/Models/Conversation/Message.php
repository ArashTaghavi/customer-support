<?php

namespace App\Models\Conversation;

use App\Enums\AITaskStatus;
use App\Models\User;
use App\Traits\HasAITaskStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

/**
 * @property array<string, mixed>|null $answer
 */
#[Fillable([
    'conversation_id',
    'question',
    'answer',
    'status',
    'error_message',
    'answered_at',
    'is_read',
])]
class Message extends Model
{
    use HasAITaskStatus;

    #[Override]
    public function statusField(): string
    {
        return 'status';
    }

    #[Override]
    public function errorField(): string
    {
        return 'error_message';
    }

    protected function casts(): array
    {
        return [
            'status' => AITaskStatus::class,
            'answer' => 'array',
            'answered_at' => 'datetime',
            'is_read' => 'boolean',
        ];
    }

    /** @return BelongsTo<Conversation, $this> */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

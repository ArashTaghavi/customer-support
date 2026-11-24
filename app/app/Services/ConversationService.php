<?php

namespace App\Services;

use App\Jobs\Ask;
use App\Models\Conversation\Conversation;
use App\Models\Conversation\Message;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ConversationService
{
    public function store(User $user, ?string $question): Conversation
    {
        $conversation = $user->conversations()->create(['title' => 'چت جدید']);
        if ($question) {
            $this->_ask(conversation: $conversation, question: $question);
        }

        return $conversation;
    }

    public function ask(Conversation $conversation, string $question): Message
    {
        $message = $this->_ask(conversation: $conversation, question: $question);

        return $message;
    }

    private function _ask(Conversation $conversation, string $question): Message
    {
        $latestAnswer = $conversation->messages()->latest('id')->first()?->answer;

        if (isset($latestAnswer['confirmation'])) {
            throw ValidationException::withMessages([
                'question' => 'ابتدا درخواست لغو سفارش را تأیید یا رد کنید.',
            ]);
        }
        $message = $conversation->messages()
            ->create([
                'question' => $question,
            ]);

        $message->conversation->update(['title' => $question]);

        Ask::dispatch($message);

        return $message;
    }
}

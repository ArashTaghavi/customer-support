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
        $conversation = $user->conversations()->create(['title' => 'New chat']);
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
                'question' => 'Confirm or decline the pending order cancellation first.',
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

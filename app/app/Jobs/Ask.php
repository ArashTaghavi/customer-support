<?php

namespace App\Jobs;

use App\Events\MessageAnswered;
use App\Models\Conversation\Message;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class Ask implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Message $message)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AIClient $aiClient): void
    {
        $this->message->markAsProcessing();

        $response = $aiClient->post('/ai/ask', [
            'conversation_id' => $this->message->conversation->uuid,
            'question' => $this->message->question,
            'user_id' => auth()->id(),
        ]);

        $answer = $response->json();

        $this->message->markAsDone(answer: $answer);
        // $this->message->conversation->update(['title' => $answer]);

        MessageAnswered::dispatch($this->message->fresh());
    }

    public function failed(?Throwable $exception): void
    {
        $this->message->markAsFailed(error: $exception?->getMessage());
    }
}

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

        $message = $this->message->fresh();
        $broadcastAnswer = $message->answer;

        foreach ($broadcastAnswer['blocks'] ?? [] as $index => $block) {
            if (in_array($block['type'], ['products', 'orders'], true)) {
                $broadcastAnswer['blocks'][$index]['data'] = array_column($block['data'], 'id');
            } elseif ($block['type'] === 'order') {
                $broadcastAnswer['blocks'][$index]['data'] = [$block['data']['id']];
            }
        }

        $message->answer = $broadcastAnswer;

        MessageAnswered::dispatch($message);
    }

    public function failed(?Throwable $exception): void
    {
        $this->message->markAsFailed(error: $exception?->getMessage());
    }
}

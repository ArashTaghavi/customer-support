<?php

namespace Database\Seeders;

use App\Enums\AITaskStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConversationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::factory()->create();

            for ($conversationNumber = 1; $conversationNumber <= 10; $conversationNumber++) {
                $conversation = $user->conversations()->create([
                    'title' => "گفتگوی آزمایشی {$conversationNumber}",
                ]);

                for ($messageNumber = 1; $messageNumber <= 20; $messageNumber++) {
                    $conversation->messages()->create([
                        'question' => "سؤال آزمایشی شماره {$messageNumber} در گفتگوی {$conversationNumber}",
                        'answer' => "پاسخ آزمایشی به سؤال شماره {$messageNumber}. برای راهنمایی بیشتر با پشتیبانی در ارتباط باشید.",
                        'status' => AITaskStatus::Completed,
                        'answered_at' => now(),
                        'is_read' => true,
                    ]);
                }
            }
        });
    }
}

<?php

namespace App\Http\Controllers;

use App\Events\MessageAnswered;
use App\Models\Conversation\Message;
use App\Services\AIClient;
use App\Services\ChatResponsePayload;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OrderCancellationController extends Controller
{
    public function __invoke(Request $request, Message $message, AIClient $aiClient): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        abort_unless((int) $message->conversation->user_id === $user->id, 404);

        $validated = $request->validate([
            'confirmed' => ['required', 'boolean'],
            'interrupt_id' => ['required', 'string', 'max:255'],
        ]);

        $lock = Cache::lock('order-cancellation:'.$message->conversation_id, 150);
        abort_unless($lock->get(), 409, 'درخواست قبلی هنوز در حال پردازش است.');

        try {
            $message->refresh();
            $confirmation = $message->answer['confirmation'] ?? null;
            abort_unless(
                is_array($confirmation)
                && ($confirmation['type'] ?? null) === 'order_cancellation_confirmation'
                && ($confirmation['thread_id'] ?? null) === $message->conversation->uuid
                && ($confirmation['interrupt_id'] ?? null) === $validated['interrupt_id'],
                409,
                'این درخواست تأیید دیگر معتبر نیست.',
            );

            try {
                $answer = $aiClient->post('/ai/confirm-cancel-order', [
                    'thread_id' => $message->conversation->uuid,
                    'interrupt_id' => $confirmation['interrupt_id'],
                    'user_id' => $user->id,
                    'confirmed' => $request->boolean('confirmed'),
                ])->json();
            } catch (ConnectionException) {
                return response()->json(['message' => 'ارتباط با سرویس برقرار نشد. دوباره تلاش کنید.'], 503);
            } catch (RequestException $exception) {
                if ($exception->response->status() !== 409) {
                    return response()->json(['message' => 'پردازش پاسخ انجام نشد. دوباره تلاش کنید.'], 502);
                }

                $answer = [
                    'message' => 'این درخواست تأیید منقضی شده است. دوباره وضعیت سفارش را بپرسید.',
                    'blocks' => [],
                ];
            }

            abort_unless(is_array($answer) && is_string($answer['message'] ?? null) && is_array($answer['blocks'] ?? null), 502);

            $message->markAsDone(answer: $answer);
            $message->answer = ChatResponsePayload::forBroadcast($answer);
            MessageAnswered::dispatch($message);

            return response()->json(['answer' => $message->answer]);
        } finally {
            $lock->release();
        }
    }
}

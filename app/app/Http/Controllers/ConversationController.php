<?php

namespace App\Http\Controllers;

use App\Jobs\Ask;
use App\Models\Conversation\Conversation;
use App\Models\Conversation\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ConversationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user() !== null, 401);
        $conversation = $request->user()->conversations()->create(['title' => 'چت جدید']);
        if ($request->has('question')) {
            $this->_ask(conversation: $conversation, question: $request->input('question'));
        }

        return to_route('conversations.show', [
            'conversation' => $conversation->uuid,
        ]);
    }

    public function show(Conversation $conversation)
    {
        return Inertia::render('app/conversation/index', [
            'selectedConversation' => $conversation,
            'messages' => $conversation->messages()->oldest()->orderBy('created_at')->get(),
        ]);
    }

    public function messages(Conversation $conversation)
    {
        return $conversation->messages()->get();
    }

    public function ask(Request $request, Conversation $conversation): RedirectResponse
    {
        abort_unless($request->user() !== null, 401);
        abort_unless((int) $conversation->user_id === $request->user()->id, 404);
        $message = $this->_ask(conversation: $conversation, question: $request->input('question'));

        return back()->with('newMessage', $message);
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
            ->create(compact('question'));

        $message->conversation->update(['title' => $question]);

        Ask::dispatch($message);

        return $message;
    }
}

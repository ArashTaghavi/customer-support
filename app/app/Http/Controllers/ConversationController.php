<?php

namespace App\Http\Controllers;

use App\Models\Conversation\Conversation;
use App\Services\ConversationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    public function __construct(private ConversationService $conversationService) {}

    public function store(Request $request): RedirectResponse
    {
        $question = $request->input('question', null);

        $conversation = $this->conversationService->store(user: $request->user(), question: $question);

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
        $message = $this->conversationService->ask(conversation: $conversation, question: $request->input('question'));

        return back()->with('newMessage', $message);
    }
}

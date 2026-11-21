<?php

namespace App\Http\Controllers;

use App\Jobs\Ask;
use App\Models\Conversation\Conversation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    public function store(Request $request)
    {

        $conversation = Conversation::create(['title' => 'چت جدید', 'user_id' => 1]);
        if ($request->has('question')) {
            $message = $conversation->messages()
                ->create([
                    'question' => $request->input('question'),
                ]);
            Ask::dispatch($message);
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
        $message = $conversation->messages()
            ->create([
                'question' => $request->input('question'),
            ]);

        Ask::dispatch($message);

        return back()->with('newMessage', $message);
    }
}

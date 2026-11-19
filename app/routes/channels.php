<?php

use App\Models\Conversation\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('conversations.{uuid}', function ($user, $uuid) {
    return Conversation::query()
        ->where('uuid', $uuid)
        ->where('user_id', $user->id)
        ->exists();
});

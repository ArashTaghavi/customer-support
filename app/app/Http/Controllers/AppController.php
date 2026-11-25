<?php

namespace App\Http\Controllers;

use App\Models\Conversation\Conversation;
use Inertia\Inertia;

class AppController extends Controller
{
    public function index()
    {
        $conversations = Conversation::all();

        return Inertia::render('user/index', compact('conversations'));
    }
}

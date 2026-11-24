<?php

namespace App\Providers;

use App\Models\Conversation\Conversation;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Route::bind('relatedConversation', function (string $value) {
            return Conversation::where('uuid', $value)
                ->where('user_id', auth()->id())
                ->firstOrFail();
        });
        
    }
}

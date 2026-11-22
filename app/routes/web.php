<?php

use App\Http\Controllers\AppController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatResponseController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\OrderCancellationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppController::class, 'index'])->name('app.index');

Route::post('messages/{message}/confirm-cancel-order', OrderCancellationController::class)
    ->name('messages.confirm-cancel-order');

Route::prefix('conversations')
    ->name('conversations.')
    ->controller(ConversationController::class)
    ->group(function () {
        Route::get('', 'index')->name('index');
        Route::post('', 'store')->name('store');
        Route::get('{conversation:uuid}', 'show')->name('show');
        Route::get('{conversation}/messages', 'messages')->name('messages');
        Route::post('{conversation:uuid}', 'ask')->name('storeMessage');
    });

Route::prefix('chat-response')
    ->name('chat-response.')
    ->controller(ChatResponseController::class)
    ->group(function () {
        Route::post('orders', 'orders')->name('orders');
        Route::post('products', 'products')->name('products');
    });

Route::prefix('cart')
    ->name('cart.')
    ->controller(CartController::class)
    ->group(function () {
        Route::post('', 'index')->name('index');
    });

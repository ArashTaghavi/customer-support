<?php

use App\Http\Controllers\AppController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatResponseController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\OrderCancellationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OtpAuthenticationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\RequireRecentOtp;
use Illuminate\Support\Facades\Route;
use Laravel\Passkeys\Http\Controllers\PasskeyLoginController;
use Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [OtpAuthenticationController::class, 'show'])->name('login');
    Route::post('/login/otp', [OtpAuthenticationController::class, 'store'])->middleware('throttle:otp-send')->name('otp.store');
    Route::delete('/login/otp', [OtpAuthenticationController::class, 'destroy'])->name('otp.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/shop', [ShopController::class, 'index'])->name('shop');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    Route::patch('/user/profile', [UserController::class, 'update'])->name('user.update');

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
            Route::prefix('{product}')->group(function () {
                Route::post('add', 'add')->name('add');
                Route::post('remove', 'remove')->name('remove');
            });

        });
});

Route::middleware(['guest', 'throttle:6,1'])->group(function (): void {
    Route::get('/passkeys/login/options', [PasskeyLoginController::class, 'index'])->name('passkey.login-options');
    Route::post('/passkeys/login', [PasskeyLoginController::class, 'store'])->name('passkey.login');
});
Route::middleware(['auth', RequireRecentOtp::class, 'throttle:6,1'])->group(function (): void {
    Route::get('/user/passkeys/options', [PasskeyRegistrationController::class, 'index'])->name('passkey.registration-options');
    Route::post('/user/passkeys', [PasskeyRegistrationController::class, 'store'])->name('passkey.store');
    Route::delete('/user/passkeys/{passkey}', [PasskeyRegistrationController::class, 'destroy'])->name('passkey.destroy');
});

<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('showroom login authenticates on the showroom so the frontend can animate before navigating', function () {
    $mobile = '09123456789';

    $this->post(route('otp.store'), ['mobile_number' => $mobile, 'return_to' => 'shop'])
        ->assertRedirectToRoute('shop')
        ->assertSessionHas('otp.challenge.mobile_number', $mobile);

    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('site/shop/index')
        ->where('otp.mobile_number', $mobile)
        ->where('auth.user', null));

    $user = User::where('mobile_number', $mobile)->firstOrFail();
    $this->withSession(['url.intended' => route('app.index')])
        ->post(route('login'), ['mobile_number' => $mobile, 'code' => $user->otp->code, 'return_to' => 'shop'])
        ->assertRedirectToRoute('shop')
        ->assertSessionMissing('url.intended')
        ->assertSessionMissing('otp.challenge');
    $this->assertAuthenticatedAs($user);
});

test('showroom login rejects an incorrect code and retains its challenge', function () {
    $mobile = '09123456789';
    $this->post(route('otp.store'), ['mobile_number' => $mobile, 'return_to' => 'shop']);

    $this->from(route('shop'))->post(route('login'), ['mobile_number' => $mobile, 'code' => '000000'])
        ->assertRedirectToRoute('shop')
        ->assertSessionHasErrors('code')
        ->assertSessionHas('otp.challenge.mobile_number', $mobile);
    $this->assertGuest();
});

test('changing the showroom login number returns to the showroom and keeps the resend cooldown', function () {
    $this->freezeTime();
    $resendAt = now()->addMinute()->timestamp;

    $this->withSession(['otp.challenge' => ['mobile_number' => '09123456789', 'resend_at' => $resendAt]])
        ->delete(route('otp.destroy'), ['return_to' => 'shop'])
        ->assertRedirectToRoute('shop')
        ->assertSessionMissing('otp.challenge')
        ->assertSessionHas('otp.resend_at', $resendAt);
});

test('showroom code requests enforce the existing resend cooldown', function () {
    $this->freezeTime();

    $this->withSession(['otp.resend_at' => now()->addMinute()->timestamp])
        ->from(route('shop'))
        ->post(route('otp.store'), ['mobile_number' => '09123456789', 'return_to' => 'shop'])
        ->assertRedirectToRoute('shop')
        ->assertSessionHasErrors('mobile_number');
    $this->assertDatabaseCount('users', 0);
});

test('standalone login stays on the login page and ignores untrusted return destinations', function ($returnTo) {
    $this->post(route('otp.store'), ['mobile_number' => '09123456789', 'return_to' => $returnTo])
        ->assertRedirectToRoute('login');
})->with([null, 'https://example.com', 'app.index']);

test('authenticated showroom visitors receive their user identity without a stale login challenge', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->withSession(['otp.challenge' => ['mobile_number' => '09123456789']])
        ->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('site/shop/index')
        ->where('auth.user.id', $user->id)
        ->where('otp', null));
});

test('standalone code login keeps its normal panel destination', function () {
    $mobile = '09123456789';
    $this->post(route('otp.store'), ['mobile_number' => $mobile]);
    $user = User::where('mobile_number', $mobile)->firstOrFail();

    $this->post(route('login'), ['mobile_number' => $mobile, 'code' => $user->otp->code])
        ->assertRedirect('/user');
    $this->assertAuthenticatedAs($user);
});

<?php

use App\Models\User;

test('guests can request a passkey login challenge', function () {
    $this->getJson(route('passkey.login-options'))
        ->assertOk()->assertJsonStructure(['options' => ['challenge', 'rpId']]);
    expect(session('passkey.verification_options'))->toBeString();
});

test('guests cannot register passkeys', function () {
    $this->getJson(route('passkey.registration-options'))->assertUnauthorized();
});

test('registration requires a recent otp login', function () {
    $user = User::factory()->make(['id' => 1, 'is_active' => true]);
    $this->actingAs($user)->getJson(route('passkey.registration-options'))->assertForbidden();
});

test('expired otp confirmation cannot register passkeys', function () {
    $user = User::factory()->make(['id' => 1, 'is_active' => true]);
    $this->actingAs($user)->withSession(['auth.otp_confirmed_at' => now()->subMinutes(6)->timestamp])
        ->postJson(route('passkey.store'), [])->assertForbidden();
});

test('inactive accounts cannot register passkeys', function () {
    $user = User::factory()->make(['id' => 1, 'is_active' => false]);
    $this->actingAs($user)->withSession(['auth.otp_confirmed_at' => now()->timestamp])
        ->getJson(route('passkey.registration-options'))->assertForbidden();
});

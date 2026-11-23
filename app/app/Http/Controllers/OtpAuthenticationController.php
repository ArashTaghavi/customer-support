<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\CreateNewUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpAuthenticationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('auth/index', [
            'otp' => $request->session()->get('otp.challenge'),
            'resendAt' => max($request->session()->get('otp.challenge.resend_at', 0), $request->session()->get('otp.resend_at', 0)),
        ]);
    }

    public function store(Request $request, CreateNewUser $createNewUser): RedirectResponse
    {
        $validated = $request->validate([
            'mobile_number' => ['required', 'string', 'regex:/\A09[0-9]{9}\z/'],
        ], [
            'mobile_number.required' => 'شماره موبایل را وارد کنید.',
            'mobile_number.string' => 'شماره موبایل باید به‌صورت متن وارد شود.',
            'mobile_number.regex' => 'شماره موبایل معتبر وارد کنید؛ مانند 09123456789.',
        ]);

        if (max($request->session()->get('otp.challenge.resend_at', 0), $request->session()->get('otp.resend_at', 0)) > now()->timestamp) {
            throw ValidationException::withMessages([
                'mobile_number' => 'برای درخواست مجدد کد کمی صبر کنید.',
            ]);
        }

        $user = $createNewUser->create($validated);
        abort_unless($user->is_active, 403, 'امکان ورود به این حساب وجود ندارد.');
        $otp = $user->otp;

        $request->session()->put('otp.challenge', [
            'user_id' => $user->id,
            'mobile_number' => $user->mobile_number,
            'length' => 6,
            'expires_at' => $otp->expires_at->timestamp,
            'resend_at' => now()->addMinute()->timestamp,
        ]);

        return to_route('login');
    }

    public function destroy(Request $request): RedirectResponse
    {
        // Keep the resend cooldown when changing the mobile number.
        $resendAt = $request->session()->get('otp.challenge.resend_at', 0);
        $request->session()->forget('otp.challenge');
        $request->session()->put('otp.resend_at', $resendAt);

        return to_route('login');
    }
}

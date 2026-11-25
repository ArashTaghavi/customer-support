<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Requests\OtpLoginRequest;
use App\Http\Responses\ShowroomLoginResponse;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Http\Requests\LoginRequest;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkeys;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(LoginRequest::class, OtpLoginRequest::class);
        $this->app->singleton(LoginResponse::class, ShowroomLoginResponse::class);
    }

    public function boot(OtpService $otpService): void
    {
        Passkeys::authorizeLoginUsing(
            fn (Request $request, PasskeyUser $user): bool => $user instanceof User && $user->is_active,
        );

        Fortify::createUsersUsing(CreateNewUser::class);

        Fortify::authenticateUsing(function (Request $request) use ($otpService): User {
            $user = User::query()
                ->whereKey($request->session()->get('otp.challenge.user_id'))
                ->where('mobile_number', $request->input('mobile_number'))
                ->where('is_active', true)
                ->first();

            if ($user === null || ! $otpService->verify($user, $request->input('code'))) {
                throw ValidationException::withMessages([
                    'code' => 'کد واردشده نادرست یا منقضی شده است. دوباره تلاش کنید یا کد جدید درخواست کنید.',
                ]);
            }

            $request->session()->put('auth.otp_confirmed_at', now()->timestamp);
            $request->session()->forget(['otp.challenge', 'otp.resend_at']);

            return $user;
        });

        RateLimiter::for('login', function (Request $request): Limit {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey)
                ->response(fn (Request $request, array $headers) => back()
                    ->withErrors(['code' => 'تعداد تلاش‌ها بیش از حد مجاز است. یک دقیقه دیگر دوباره تلاش کنید.'])
                    ->withHeaders($headers));
        });

        RateLimiter::for('otp-send', function (Request $request): Limit {
            return Limit::perMinute(6)->by($request->ip())
                ->response(fn (Request $request, array $headers) => back()
                    ->withErrors(['mobile_number' => 'تعداد درخواست‌های کد بیش از حد مجاز است. یک دقیقه دیگر دوباره تلاش کنید.'])
                    ->withHeaders($headers));
        });
    }
}

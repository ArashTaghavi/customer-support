<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRecentOtp
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->is_active, 403);
        abort_if(now()->timestamp - (int) $request->session()->get('auth.otp_confirmed_at', 0) > 300, 403,
            'برای ثبت یا حذف کلید، دوباره با کد یک‌بارمصرف وارد شوید.');

        return $next($request);
    }
}

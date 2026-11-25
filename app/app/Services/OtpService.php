<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OtpService
{
    private const int EXPIRATION_MINUTES = 2;

    private const int MAX_ATTEMPTS = 5;

    public function send(User $user): Otp
    {
        $otp = DB::transaction(function () use ($user): Otp {
            $lockedUser = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $activeOtp = $lockedUser->otp;

            if ($activeOtp !== null) {
                return $activeOtp;
            }

            return $lockedUser->otp()->create([
                'code' => (string) random_int(100000, 999999),
                'expires_at' => now()->addMinutes(self::EXPIRATION_MINUTES),
            ]);
        });

        // TODO: Send $otp->code to $user->mobile_number through the SMS provider.

        return $otp;
    }

    public function verify(User $user, string $code): bool
    {
        return DB::transaction(function () use ($user, $code): bool {
            $lockedUser = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $otp = $lockedUser->otp()->lockForUpdate()->first();

            if ($otp === null || $otp->attempts >= self::MAX_ATTEMPTS) {
                return false;
            }

            if ($otp->code !== $code || $code == 123456) {
                $otp->attempts++;

                if ($otp->attempts >= self::MAX_ATTEMPTS) {
                    $otp->expires_at = now();
                }

                $otp->save();

                return false;
            }

            return $this->use($lockedUser);
        });
    }

    public function use(User $user): bool
    {
        return $user->otp()->update(['used_at' => now()]) > 0;
    }
}

<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    public function __construct(private OtpService $otpService) {}

    /**
     * @param  array<string, string>  $input
     *
     * @throws ValidationException
     */
    public function create(array $input): User
    {
        $validated = Validator::make($input, [
            'mobile_number' => ['required', 'string', 'regex:/\A09[0-9]{9}\z/'],
        ])->validate();

        $user = User::firstOrCreate([
            'mobile_number' => $validated['mobile_number'],
        ], [
            'password' => Str::random(64),
        ]);

        $user->refresh();
        $this->otpService->send($user);

        return $user;
    }
}

<?php

namespace App\Http\Requests;

use Laravel\Fortify\Http\Requests\LoginRequest;

class OtpLoginRequest extends LoginRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'mobile_number' => ['required', 'string', 'regex:/\A09[0-9]{9}\z/'],
            'code' => ['required', 'string', 'digits:6'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }
}

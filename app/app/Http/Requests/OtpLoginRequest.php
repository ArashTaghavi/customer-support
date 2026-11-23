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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [

            'mobile_number.required' => 'شماره موبایل را وارد کنید.',
            'mobile_number.string' => 'شماره موبایل باید به‌صورت متن وارد شود.',
            'mobile_number.regex' => 'شماره موبایل معتبر وارد کنید؛ مانند 09123456789.',
            'code.required' => 'کد تأیید را وارد کنید.',
            'code.string' => 'کد تأیید باید به‌صورت متن وارد شود.',
            'code.digits' => 'کد تأیید باید ۶ رقمی باشد.',
            'remember.boolean' => 'مقدار گزینهٔ مرا به خاطر بسپار معتبر نیست.',
        ];
    }
}

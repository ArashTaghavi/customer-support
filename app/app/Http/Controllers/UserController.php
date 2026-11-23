<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class UserController extends Controller
{
    public function update(Request $request, FileUploadService $fileUploadService): RedirectResponse
    {
        $user = $request->user();
        $fileUploadService->disk('public');

        $validated = $request->validate([
            'first_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique(User::class)->ignore($user)],
            'username' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique(User::class)->ignore($user)],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'string' => ':attribute باید به‌صورت متن وارد شود.',
            'max.string' => ':attribute نباید بیش از :max کاراکتر باشد.',
            'email.email' => 'ایمیل معتبر وارد کنید.',
            'email.unique' => 'این ایمیل قبلاً استفاده شده است.',
            'username.unique' => 'این نام کاربری قبلاً استفاده شده است.',
            'avatar.image' => 'فایل انتخاب‌شده باید تصویر باشد.',
            'avatar.mimes' => 'تصویر باید با فرمت JPG، PNG یا WebP باشد.',
            'avatar.max' => 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد.',
        ], [
            'first_name' => 'نام',
            'last_name' => 'نام خانوادگی',
            'username' => 'نام کاربری',
        ]);

        $oldAvatar = $user->avatar;
        $newAvatar = null;

        if ($request->hasFile('avatar')) {
            $newAvatar = $fileUploadService->upload($request->file('avatar'), 'avatars');
            $validated['avatar'] = $newAvatar;
        }

        try {
            $user->update($validated);
        } catch (Throwable $e) {
            if ($newAvatar) {
                $fileUploadService->delete($newAvatar);
            }

            throw $e;
        }

        if ($newAvatar && $oldAvatar) {
            $fileUploadService->delete($oldAvatar);
        }

        return back();
    }
}

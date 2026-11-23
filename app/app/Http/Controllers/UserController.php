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

        $validated = $request->validate([
            'first_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique(User::class)->ignore($user)],
            'username' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique(User::class)->ignore($user)],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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

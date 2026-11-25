<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Throwable;

class UserService
{
    public function __construct(public FileUploadService $fileUploadService) {}

    public function update(
        User $user,
        ?UploadedFile $file = null,
        ?string $first_name = '',
        ?string $last_name = '',
        ?string $email = '',
        ?string $username = ''
    ) {
        $oldAvatar = $user->avatar;
        $newAvatar = null;

        if ($file) {
            $newAvatar = $this->fileUploadService->upload($file, 'avatars');
            $validated['avatar'] = $newAvatar;
        }

        try {
            $user->update([
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email,
                'username' => $username,
                'avatar' => $newAvatar ?? $oldAvatar,
            ]);
        } catch (Throwable $e) {
            if ($newAvatar) {
                $this->fileUploadService->delete($newAvatar);
            }

            throw $e;
        }

        if ($newAvatar && $oldAvatar) {
            $this->fileUploadService->delete($oldAvatar);
        }

    }
}

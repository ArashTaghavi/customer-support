<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class FileUploadService
{
    private string $disk = 'public';

    public function disk(string $disk = 'public'): static
    {
        $this->disk = $disk;

        return $this;
    }

    public function upload(UploadedFile $file, string $directory = 'uploads'): string
    {
        $path = Storage::disk($this->disk)->putFile($directory, $file);

        if ($path === false) {
            throw new RuntimeException('Failed to upload the file.');
        }

        return $path;
    }

    public function delete(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }

    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }
}

<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class GlbFile implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            return;
        }
        if (strtolower($value->getClientOriginalExtension()) !== 'glb') {
            $fail('Upload a GLB file.');

            return;
        }
        $header = file_get_contents($value->getRealPath(), false, null, 0, 20);
        if ($header === false || strlen($header) !== 20 || substr($header, 0, 4) !== 'glTF') {
            $fail('The file is not a valid binary glTF model.');

            return;
        }
        $fields = unpack('Vversion/Vlength/VjsonLength/VjsonType', substr($header, 4));
        if ($fields['version'] !== 2 || $fields['length'] !== $value->getSize() || $fields['jsonType'] !== 0x4E4F534A || $fields['jsonLength'] % 4 !== 0 || $fields['jsonLength'] < 2 || $fields['jsonLength'] > 8 * 1024 * 1024 || $value->getSize() < $fields['jsonLength'] + 20) {
            $fail('Upload a complete GLB 2.0 file.');

            return;
        }
        $json = file_get_contents($value->getRealPath(), false, null, 20, $fields['jsonLength']);
        $model = $json === false ? null : json_decode($json, true);
        if (! is_array($model) || ($model['asset']['version'] ?? null) !== '2.0') {
            $fail('The GLB model metadata is invalid.');

            return;
        }
        $offset = 20 + $fields['jsonLength'];
        while ($offset < $value->getSize()) {
            $chunkHeader = file_get_contents($value->getRealPath(), false, null, $offset, 8);
            if ($chunkHeader === false || strlen($chunkHeader) !== 8) {
                $fail('The GLB file contains a truncated binary chunk.');

                return;
            }
            $chunk = unpack('Vlength/Vtype', $chunkHeader);
            if ($chunk['length'] % 4 !== 0 || $offset + 8 + $chunk['length'] > $value->getSize()) {
                $fail('The GLB file contains a truncated binary chunk.');

                return;
            }
            $offset += 8 + $chunk['length'];
        }
        foreach (['buffers', 'images'] as $section) {
            if (! is_array($model[$section] ?? [])) {
                $fail('The GLB model metadata is invalid.');

                return;
            }
            foreach ($model[$section] ?? [] as $entry) {
                if (! is_array($entry)) {
                    $fail('The GLB model metadata is invalid.');

                    return;
                }
                $uri = $entry['uri'] ?? null;
                if ($uri !== null && (! is_string($uri) || ! str_starts_with($uri, 'data:'))) {
                    $fail('Use a self-contained GLB with its textures and buffers embedded.');

                    return;
                }
            }
        }
    }
}

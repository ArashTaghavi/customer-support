<?php

namespace Database\Seeders;

use App\Models\Policy\PolicyCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class PolicySeeder extends Seeder
{
    public function run(): void
    {
        $data = Validator::make([
            'categories' => File::json(storage_path('app/private/policies.json'), JSON_THROW_ON_ERROR),
        ], [
            'categories' => ['required', 'array', 'list'],
            'categories.*.name' => ['required', 'string', 'max:255', 'distinct'],
            'categories.*.policies' => ['required', 'array', 'list'],
            'categories.*.policies.*' => ['required', 'string'],
        ])->validate();

        DB::transaction(function () use ($data) {
            foreach ($data['categories'] as $categoryData) {
                $category = PolicyCategory::firstOrCreate(['name' => $categoryData['name']]);

                foreach ($categoryData['policies'] as $content) {
                    $category->policies()->firstOrCreate(['content' => $content]);
                }
            }
        });
    }
}

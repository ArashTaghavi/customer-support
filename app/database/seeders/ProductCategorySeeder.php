<?php

namespace Database\Seeders;

use App\Models\Product\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $records = [
            'Mobile and Tablets',
            'Laptop and Computers',
            'Gaming & Consoles',
            'Digital Accessories',
        ];

        foreach ($records as $record) {
            ProductCategory::create(['title' => $record]);
        }
    }
}

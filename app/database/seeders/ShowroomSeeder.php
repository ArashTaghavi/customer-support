<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ShowroomSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(ProductModelSeeder::class);
    }
}

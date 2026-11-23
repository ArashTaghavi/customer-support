<?php

namespace Database\Seeders;

use App\Models\Order\Order;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            User::firstOrFail()
                ->orders()
                ->createMany(
                    Order::factory()->count(20)->make()->toArray()
                );
        });
    }
}

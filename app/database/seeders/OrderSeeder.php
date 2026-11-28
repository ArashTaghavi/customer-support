<?php

namespace Database\Seeders;

use App\Enums\OrderStatusEnum;
use App\Models\Order\Order;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::query()->orderBy('id')->firstOrFail();

            Order::factory()
                ->for($user)
                ->count(20)
                ->sequence(
                    ...array_map(
                        fn (OrderStatusEnum $status): array => ['order_status' => $status],
                        OrderStatusEnum::cases(),
                    ),
                )
                ->create();
        });
    }
}

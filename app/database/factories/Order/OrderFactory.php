<?php

namespace Database\Factories\Order;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentMethodEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Order\Order;
use App\Models\Product\Product;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'DEMO-'.Str::uuid(),
            'total_amount' => 0,
            'order_status' => OrderStatusEnum::Pending,
            'payment_status' => fn (array $attributes): PaymentStatusEnum => match ($attributes['order_status']) {
                OrderStatusEnum::Pending => PaymentStatusEnum::Unpaid,
                OrderStatusEnum::Cancelled => PaymentStatusEnum::Refunded,
                default => PaymentStatusEnum::Paid,
            },
            'shipping_address' => 'تهران، خیابان ولیعصر، کوچه یاس، پلاک '.fake()->numberBetween(1, 100).'، واحد '.fake()->numberBetween(1, 10),
            'created_at' => CarbonImmutable::instance(fake()->dateTimeBetween('-100 days', '-4 days')),
            'paid_at' => fn (array $attributes): ?CarbonImmutable => in_array($attributes['payment_status'], [PaymentStatusEnum::Paid, PaymentStatusEnum::Refunded], true)
                ? CarbonImmutable::parse($attributes['created_at'])->addMinutes(10) : null,
            'shipped_at' => fn (array $attributes): ?CarbonImmutable => in_array($attributes['order_status'], [OrderStatusEnum::Shipped, OrderStatusEnum::Delivered], true)
                ? CarbonImmutable::parse($attributes['created_at'])->addDay() : null,
            'delivered_at' => fn (array $attributes): ?CarbonImmutable => $attributes['order_status'] === OrderStatusEnum::Delivered
                ? CarbonImmutable::parse($attributes['created_at'])->addDays(3) : null,
            'cancelled_at' => fn (array $attributes): ?CarbonImmutable => $attributes['order_status'] === OrderStatusEnum::Cancelled
                ? CarbonImmutable::parse($attributes['created_at'])->addDay() : null,
            'cancellation_reason' => fn (array $attributes): ?string => $attributes['order_status'] === OrderStatusEnum::Cancelled
                ? 'لغو سفارش به درخواست مشتری' : null,
            'tracking_code' => fn (array $attributes): ?string => $attributes['shipped_at'] !== null
                ? 'DEMO-TRACK-'.Str::uuid() : null,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Order $order): void {
            $products = Product::query()->where('price', '>', 0)->inRandomOrder()->limit(fake()->numberBetween(1, 4))->get();
            if ($products->isEmpty()) {
                throw new RuntimeException('Seed products before creating orders.');
            }

            $totalAmount = 0;
            foreach ($products as $product) {
                $quantity = fake()->numberBetween(1, 3);
                $totalPrice = $product->price * $quantity;
                $totalAmount += $totalPrice;
                $order->orderItems()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'total_price' => $totalPrice,
                    'created_at' => $order->created_at,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);
            $wasPaid = in_array($order->payment_status, [PaymentStatusEnum::Paid, PaymentStatusEnum::Refunded], true);
            $order->payments()->create([
                'amount' => $totalAmount,
                'status' => $order->payment_status,
                'method' => fake()->randomElement(PaymentMethodEnum::cases()),
                'transaction_id' => $order->payment_status !== PaymentStatusEnum::Unpaid ? 'DEMO-TXN-'.Str::uuid() : null,
                'reference_id' => $wasPaid ? 'DEMO-REF-'.Str::uuid() : null,
                'paid_at' => $order->paid_at,
                'refunded_at' => $order->payment_status === PaymentStatusEnum::Refunded ? $order->cancelled_at->addMinutes(30) : null,
                'failure_reason' => $order->payment_status === PaymentStatusEnum::Failed ? 'پرداخت توسط بانک تأیید نشد.' : null,
                'created_at' => $order->created_at,
            ]);
        });
    }
}

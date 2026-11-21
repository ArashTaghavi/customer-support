<?php

namespace App\Http\Resources\Order;

use App\Models\Order\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'order_number' => $this->order_number,
            'total_amount' => $this->total_amount,
            'order_status' => $this->order_status,
            'payment_status' => $this->payment_status,
            'tracking_code' => $this->tracking_code,
            'shipping_address' => $this->shipping_address,
            'paid_at' => $this->paid_at,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at,
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}

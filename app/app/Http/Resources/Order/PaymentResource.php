<?php

namespace App\Http\Resources\Order;

use App\Models\Order\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
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
            'order_id' => $this->order_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'method' => $this->method,
            'transaction_id' => $this->transaction_id,
            'reference_id' => $this->reference_id,
            'paid_at' => $this->paid_at,
            'refunded_at' => $this->refunded_at,
            'failure_reason' => $this->failure_reason,
            'created_at' => $this->created_at,
        ];
    }
}

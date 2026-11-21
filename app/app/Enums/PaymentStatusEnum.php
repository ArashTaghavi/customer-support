<?php

namespace App\Enums;

enum PaymentStatusEnum: string
{
    case Unpaid = 'UNPAID';
    case Paid = 'PAID';
    case Failed = 'FAILED';
    case Refunded = 'REFUNDED';
}

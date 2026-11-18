<?php

namespace App\Enums;

enum AITaskStatus: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'Failed';
}

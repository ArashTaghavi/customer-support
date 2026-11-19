<?php

namespace App\Traits;

use App\Enums\AITaskStatus;

trait HasAITaskStatus
{
    abstract public function statusField(): string;

    abstract public function errorField(): string;

    public function markAsProcessing(): void
    {
        $this->update([
            $this->statusField() => AITaskStatus::Processing,
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            $this->statusField() => AITaskStatus::Completed,
        ]);
    }

    public function markAsDone(string $answer): void
    {
        $this->update([
            $this->statusField() => AITaskStatus::Completed,
            'answer' => $answer,
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            $this->statusField() => AITaskStatus::Failed,
            $this->errorField() => $error,
        ]);
    }
}

export const AITaskStatus = {
    Pending: 'PENDING',
    Processing: 'PROCESSING',
    Completed: 'COMPLETED',
    Failed: 'FAILED',
} as const;

export type AITaskStatus = (typeof AITaskStatus)[keyof typeof AITaskStatus];

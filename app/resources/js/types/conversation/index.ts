import { AITaskStatus } from '../status';

export type ConversationResponse = {
    uuid: string;
    title: string;
    created_at: string;
};

export type MessageResponse = {
    id: number;
    conversation_id: number;
    question: string;
    answer: string | null;
    status: AITaskStatus;
    error_message: string | null;
    answered_at: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
};

export type MessagePayload = {
    question: string;
};

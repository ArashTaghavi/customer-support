import { AITaskStatus } from '../status';
import type { ChatResponse } from '../chat_response';

export type ConversationResponse = {
    uuid: string;
    title: string;
    created_at: string;
};

export type MessageResponse = {
    id: number;
    conversation_id: number;
    question: string;
    answer: ChatResponse | string | null;
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

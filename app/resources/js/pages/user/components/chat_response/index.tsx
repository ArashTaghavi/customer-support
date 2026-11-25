import PolicyResponse from './policy_response';
import PaginatedResponse from './paginated_response';
import CancellationConfirmation from './cancellation_confirmation';
import { parseChatResponse } from './parse_response';
import type { ChatResponse as ChatResponseData } from '@/types/chat_response';

type ChatResponseProps = {
    answer: ChatResponseData | string;
    messageId: number;
    onAnswer: (answer: ChatResponseData) => void;
};

export default function ChatResponse({
    answer,
    messageId,
    onAnswer,
}: ChatResponseProps) {
    const response = parseChatResponse(answer);

    if (!response) {
        return (
            <PolicyResponse
                message={typeof answer === 'string' ? answer : answer.message}
            />
        );
    }

    return (
        <div className="min-w-0 space-y-3">
            <PolicyResponse message={response.message} />
            {response.confirmation && (
                <CancellationConfirmation
                    key={response.confirmation.interrupt_id}
                    messageId={messageId}
                    confirmation={response.confirmation}
                    onAnswer={onAnswer}
                />
            )}
            {response.blocks.map((block, index) => (
                <PaginatedResponse
                    key={`${block.type}-${index}-${block.data.join(',')}`}
                    {...block}
                />
            ))}
        </div>
    );
}

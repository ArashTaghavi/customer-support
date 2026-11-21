import PolicyResponse from './policy_response';
import PaginatedResponse from './paginated_response';
import { parseChatResponse } from './parse_response';
import type { ChatResponse as ChatResponseData } from '@/types/chat_response';

type ChatResponseProps = {
    answer: ChatResponseData | string;
};

export default function ChatResponse({ answer }: ChatResponseProps) {
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
            {response.blocks.length === 0 && (
                <PolicyResponse message={response.message} />
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

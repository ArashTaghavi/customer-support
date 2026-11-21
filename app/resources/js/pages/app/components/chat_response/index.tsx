import PolicyResponse from './policy_response';
import ProductsResponse from './products_response';
import OrderResponse from './order_response';
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
            <PolicyResponse message={response.message} />
            {response.blocks.map((block, index) => {
                switch (block.type) {
                    case 'products':
                        return (
                            <ProductsResponse
                                key={`products-${index}`}
                                products={block.data}
                            />
                        );
                    case 'order':
                        return (
                            <OrderResponse
                                key={`order-${index}`}
                                order={block.data}
                            />
                        );
                }
            })}
        </div>
    );
}

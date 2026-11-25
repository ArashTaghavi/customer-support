import AppLayout from '../layout';
import Chat from '../components/chat';
import type {
    ConversationResponse,
    MessageResponse,
} from '@/types/conversation';

type ConversationProps = {
    messages: MessageResponse[];
    selectedConversation: ConversationResponse;
};

export default function Conversation({
    messages,
    selectedConversation,
}: ConversationProps) {
    return (
        <Chat messages={messages} selectedConversation={selectedConversation} />
    );
}

Conversation.layout = AppLayout;

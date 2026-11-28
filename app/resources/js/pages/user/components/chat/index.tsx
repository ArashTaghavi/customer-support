import { useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { router } from '@inertiajs/react';
import { store, storeMessage } from '@/routes/conversations';
import type {
    ConversationResponse,
    MessagePayload,
    MessageResponse,
} from '@/types/conversation';
import ChatMessages from '../chat_messages';
import ChatQuestionForm from '../chat_question_form';
import MessageHistory from '../message_history';
import WelcomeMessage from '../welcome_message';
import PublicBackground from '@/components/PublicBackground';

type ChatProps = {
    messages?: MessageResponse[];
    selectedConversation?: ConversationResponse;
    animated?: boolean;
};

export default function Chat({
    messages = [],
    selectedConversation,
    animated = false,
}: ChatProps) {
    const messagesRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const container = messagesRef.current;
        if (!container) return;

        const scrollToBottom = () => {
            if (!container.querySelector('[data-chat-message]')) return;
            container.scrollTop = container.scrollHeight;
        };

        scrollToBottom();

        let followOutput = true;
        const trackScroll = () => {
            followOutput =
                container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight <
                80;
        };
        container.addEventListener('scroll', trackScroll, { passive: true });

        const mutationObserver = new MutationObserver((records) => {
            const hasMessageChanges = records.some((record) => {
                const element =
                    record.target instanceof Element
                        ? record.target
                        : record.target.parentElement;
                return !element?.closest('[data-chat-pagination]');
            });
            if (followOutput && hasMessageChanges) scrollToBottom();
        });
        mutationObserver.observe(container, {
            childList: true,
            characterData: true,
            subtree: true,
        });

        const resizeObserver = new ResizeObserver(() => {
            if (followOutput) scrollToBottom();
        });
        resizeObserver.observe(container);

        return () => {
            mutationObserver.disconnect();
            resizeObserver.disconnect();
            container.removeEventListener('scroll', trackScroll);
        };
    }, [selectedConversation?.uuid]);

    const [asking, setAsking] = useState(false);
    const questionForm = useForm<MessagePayload>({
        defaultValues: { question: '' },
    });

    function sendQuestion({ question }: MessagePayload) {
        if (asking || !question.trim()) return;
        router.post(
            selectedConversation
                ? storeMessage.url(selectedConversation.uuid)
                : store.url(),
            { question },
            {
                preserveScroll: true,
                onStart: () => setAsking(true),
                onSuccess: () => questionForm.reset(),
                onFinish: () => setAsking(false),
            },
        );
    }

    const hasQuestion = !!questionForm.watch('question')?.trim();

    return (
        <div
            className={`relative isolate flex h-full min-h-0 min-w-0 flex-col overflow-hidden ${!selectedConversation || messages.length === 0 ? 'bg-canvas' : ''}`}
        >
            {(!selectedConversation || messages.length === 0) && (
                <PublicBackground />
            )}
            <ChatMessages
                messagesRef={messagesRef}
                label="Conversation messages"
            >
                {selectedConversation && messages.length > 0 ? (
                    <MessageHistory
                        key={selectedConversation.uuid}
                        turns={messages}
                        selectedConversation={selectedConversation}
                    />
                ) : (
                    <WelcomeMessage animated={animated} />
                )}
            </ChatMessages>
            <ChatQuestionForm
                questionForm={questionForm}
                sendQuestion={sendQuestion}
                asking={asking}
                hasQuestion={hasQuestion}
                placeholder="Write a message…"
            />
        </div>
    );
}

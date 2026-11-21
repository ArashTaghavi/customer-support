import { router, useHttp, usePage } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    ChatHeader,
    ChatMessages,
    ChatQuestionForm,
    ChatSidebar,
    MessageHistory,
} from '@/components/chat';
import {
    ConversationResponse,
    MessagePayload,
    MessageResponse,
} from '@/types/conversation';
import WelcomeMessage from '../welcome_message';
import { useEcho } from '@laravel/echo-react';
import { Events } from '@/types/events';

export default function Chat() {
    const {
        props: { conversations, messages, selectedConversation },
    } = usePage<{
        conversations: ConversationResponse[];
        messages: MessageResponse[];
        selectedConversation: ConversationResponse | null;
    }>();

    const [asking, setAsking] = useState(false);

    const questionForm = useForm<MessagePayload>({
        defaultValues: { question: '' },
    });

    const messagesRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const container = messagesRef.current;

        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [selectedConversation?.uuid, messages?.length]);

    function newChat() {
        router.post(
            '/conversations',
            {},
            {
                onSuccess: () => {
                    questionForm.reset();
                },
            },
        );
    }

    function sendQuestion({ question }: MessagePayload) {
        setAIAnswerMessage(null);
        const url = selectedConversation
            ? `/conversations/${selectedConversation.uuid}`
            : '/conversations';

        router.post(
            url,
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

    const [aiAnswerMessage, setAIAnswerMessage] =
        useState<MessageResponse | null>(null);

    useEcho<{ message: MessageResponse }>(
        `conversations.${selectedConversation?.uuid}`,
        Events.MessageAnswered,
        ({ message }) => {
            setAIAnswerMessage(message);
        },
    );

    return (
        <div
            dir="rtl"
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden text-zinc-100"
        >
            <ChatSidebar conversations={conversations} newChat={newChat} />

            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                <ChatHeader
                    title={selectedConversation?.title ?? 'گفتگوی جدید'}
                    subtitle="پشتیبانی مشتریان · نمایش آزمایشی"
                />

                <ChatMessages messagesRef={messagesRef} label="پیام‌های گفتگو">
                    {selectedConversation && messages?.length > 0 ? (
                        <MessageHistory
                            turns={messages}
                            aiAnswerMessage={aiAnswerMessage}
                        />
                    ) : (
                        <WelcomeMessage />
                    )}
                </ChatMessages>

                <ChatQuestionForm
                    questionForm={questionForm}
                    sendQuestion={sendQuestion}
                    asking={asking}
                    hasQuestion={hasQuestion}
                    placeholder="پیام خود را بنویسید…"
                />
            </section>
        </div>
    );
}

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Header, WelcomeMessage } from './components';
import {
    ChatHeader,
    ChatMessages,
    ChatQuestionForm,
    ChatSidebar,
    MessageHistory,
} from '@/components/chat';
import styles from './index.module.css';
import { router, usePage } from '@inertiajs/react';
import type {
    ConversationResponse,
    MessagePayload,
    MessageResponse,
} from '@/types/conversation';

type AppLayoutProps = {
    children: ReactNode;
};

type ChatPageProps = {
    messages?: MessageResponse[];
    selectedConversation?: ConversationResponse;
    conversations: ConversationResponse[];
};

export default function AppLayout({ children }: AppLayoutProps) {
    const messagesRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const container = messagesRef.current;
        if (!container) return;

        const scrollToBottom = () => {
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
    }, []);

    const { messages = [], selectedConversation } =
        usePage<ChatPageProps>().props;

    const [asking, setAsking] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const questionForm = useForm<MessagePayload>({
        defaultValues: { question: '' },
    });

    function sendQuestion({ question }: MessagePayload) {
        router.post(
            selectedConversation
                ? `/conversations/${selectedConversation.uuid}`
                : '/conversations',
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
            dir="rtl"
            className="flex h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden"
        >
            <Header />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <ChatSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main
                    className={`${styles.chat} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden text-zinc-100`}
                >
                    <div className={styles.edgeShine} aria-hidden="true" />
                    <ChatHeader
                        title={selectedConversation?.title ?? 'گفتگوی جدید'}
                        subtitle="پشتیبانی مشتریان · نمایش آزمایشی"
                        sidebarOpen={sidebarOpen}
                        onOpenSidebar={() => setSidebarOpen(true)}
                    />
                    <ChatMessages
                        messagesRef={messagesRef}
                        label="پیام‌های گفتگو"
                    >
                        {selectedConversation && messages.length > 0 ? (
                            <MessageHistory
                                key={selectedConversation.uuid}
                                turns={messages}
                                selectedConversation={selectedConversation}
                            />
                        ) : (
                            <WelcomeMessage />
                        )}
                    </ChatMessages>
                    {children}
                    <ChatQuestionForm
                        questionForm={questionForm}
                        sendQuestion={sendQuestion}
                        asking={asking}
                        hasQuestion={hasQuestion}
                        placeholder="پیام خود را بنویسید…"
                    />
                </main>
            </div>
        </div>
    );
}

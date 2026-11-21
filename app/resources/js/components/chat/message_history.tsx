import { groupMessagesByDay, messageDate } from '@/utils/message_dates';

type MessageHistoryProps = {
    turns: MessageResponse[];
    selectedConversation: ConversationResponse;
};
type MessageTimeProps = { timestamp: string };
import { UserRound } from 'lucide-react';
import styles from './message_history.module.css';
import { TypingIndicator, AssistantMessage } from '@/components/chat';

import ChatResponse from '@/pages/app/components/chat_response';
import { parseChatResponse } from '@/pages/app/components/chat_response/parse_response';
import { ConversationResponse, MessageResponse } from '@/types/conversation';
import { useEcho } from '@laravel/echo-react';
import { Events } from '@/types/events';
import { useState } from 'react';

function MessageTime({ timestamp }: MessageTimeProps) {
    const date = messageDate(timestamp);
    if (!date.iso) return null;
    return (
        <time
            dateTime={date.iso}
            title={date.full}
            aria-label={date.full}
            dir="ltr"
            className="mt-2 block text-right text-[10px] text-zinc-400 tabular-nums"
        >
            {date.time}
        </time>
    );
}

export default function MessageHistory({
    turns,
    selectedConversation,
}: MessageHistoryProps) {
    const [receivedAnswers, setReceivedAnswers] = useState<
        Record<number, MessageResponse['answer']>
    >({});

    useEcho<{ message: MessageResponse }>(
        `conversations.${selectedConversation.uuid}`,
        Events.MessageAnswered,
        ({ message }) => {
            setReceivedAnswers((current) => ({
                ...current,
                [message.id]: message.answer,
            }));
        },
    );

    return groupMessagesByDay(turns).map((group) => (
        <section
            key={group.day}
            aria-label={group.label}
            className="relative w-full space-y-4 pb-2"
        >
            <div className="sticky top-0 z-10 flex justify-center py-2">
                <span
                    dir="ltr"
                    className="rounded-full border border-white/15 bg-[#252533]/90 px-4 py-1.5 text-[11px] text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-md"
                >
                    {group.label}
                </span>
            </div>
            {group.turns.map((turn) => {
                const answer = receivedAnswers[turn.id] ?? turn.answer;
                const hasBlocks =
                    answer != null &&
                    (parseChatResponse(answer)?.blocks.length ?? 0) > 0;

                return (
                    <div
                        key={turn.id}
                        data-chat-message
                        className="min-w-0 space-y-3"
                    >
                        <div
                            className={`${styles.bubble} ${styles.user} ml-auto w-fit max-w-[92%] rounded-3xl rounded-tr-md px-3 py-2.5 sm:max-w-[82%]`}
                        >
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                                <span className="flex size-6 items-center justify-center rounded-lg border border-violet-200/20 bg-violet-300/15">
                                    <UserRound size={13} aria-hidden="true" />
                                </span>
                                شما
                            </div>
                            <p
                                dir="auto"
                                className="text-sm leading-7 wrap-break-word whitespace-pre-wrap text-zinc-100"
                            >
                                {turn.question}
                            </p>
                            <MessageTime timestamp={turn.created_at} />
                        </div>
                        <AssistantMessage fullWidth={hasBlocks}>
                            {answer != null ? (
                                <ChatResponse
                                    answer={answer}
                                    messageId={turn.id}
                                    onAnswer={(nextAnswer) =>
                                        setReceivedAnswers((current) => ({
                                            ...current,
                                            [turn.id]: nextAnswer,
                                        }))
                                    }
                                />
                            ) : (
                                <TypingIndicator />
                            )}
                        </AssistantMessage>
                    </div>
                );
            })}
        </section>
    ));
}

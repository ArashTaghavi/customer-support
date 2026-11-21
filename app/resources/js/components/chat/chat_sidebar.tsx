import { Link, router, usePage } from '@inertiajs/react';
import { FileText, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { messageDate } from '@/utils/message_dates';
import { ConversationResponse } from '@/types/conversation';

export default function ChatSidebar() {
    const {
        props: { conversations },
    } = usePage<{
        conversations: ConversationResponse[];
    }>();

    function newChat() {
        router.post(
            '/conversations',
            {},
            {
                onSuccess: () => {
                    // questionForm.reset();
                },
            },
        );
    }
    return (
        <>
            {/* <div className={styles.edgeShine} aria-hidden="true" /> */}

            <aside
                aria-label="Conversations"
                className={`${true ? 'flex' : 'hidden md:flex'} border-ui-border h-full min-h-0 w-full shrink-0 flex-col border-r bg-[#101016] md:w-64 xl:w-80`}
            >
                <div className="border-ui-border shrink-0 space-y-4 border-b p-5">
                    <h1 className="flex items-center gap-2 font-semibold">
                        <MessageSquare size={20} className="text-violet-300" />{' '}
                        {'title'}
                    </h1>
                    <Button
                        fullWidth
                        size="sm"
                        onClick={newChat}
                        disabled={false}
                        startIcon={<Plus size={16} />}
                    >
                        گفتگوی جدید
                    </Button>
                </div>
                <nav
                    aria-label="Chat history"
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
                >
                    {conversations.length === 0 && (
                        <p className="text-ui-muted p-3 text-center text-xs">
                            هنوز هیچ گفتگویی ندارید
                        </p>
                    )}
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.uuid}
                            href={`/conversations/${conversation.uuid}`}
                            preserveScroll
                            aria-disabled={false}
                            className={`flex w-full gap-3 rounded-xl p-3 text-start transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${true ? 'bg-violet-500/15 ring-1 ring-violet-400/20' : 'hover:bg-white/5'}`}
                        >
                            <FileText
                                size={18}
                                className="mt-1 shrink-0 text-violet-300"
                                aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-zinc-200">
                                    {conversation.title}
                                </span>

                                {conversation.created_at && (
                                    <time
                                        dateTime={conversation.created_at}
                                        title={
                                            messageDate(conversation.created_at)
                                                .full
                                        }
                                        className="text-ui-muted mt-1 block text-xs"
                                    >
                                        {
                                            messageDate(conversation.created_at)
                                                .time
                                        }
                                    </time>
                                )}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}

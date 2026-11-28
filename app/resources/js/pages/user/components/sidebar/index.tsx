import SidebarItem from './item';

export type Message = { id: number; content: string; unread: boolean };
type PropsType = {
    messages: Message[];
};

export default function Sidebar({ messages }: PropsType) {
    return (
        <div className="flex min-h-0 flex-col gap-2 p-3">
            <div className="px-3 py-2 text-sm text-muted">Conversations</div>
            {messages?.map((message: Message) => (
                <SidebarItem
                    unread={message.unread}
                    content={message.content}
                    id={message.id}
                    key={`message-${message.id}`}
                />
            ))}
        </div>
    );
}

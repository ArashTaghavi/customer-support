import { MessageSquare } from 'lucide-react';
import type { Message } from '.';

export default function SidebarItem(props: Message) {
    return (
        <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-white/10"
        >
            <MessageSquare size={16} className="shrink-0" />
            <span className="truncate">{props.content}</span>
            {props.unread && (
                <span className="ms-auto flex shrink-0 items-center">
                    <span className="size-1.5 rounded-full bg-red-500" />
                </span>
            )}
        </button>
    );
}

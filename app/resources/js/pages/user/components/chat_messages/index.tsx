import type { ReactNode, Ref } from 'react';
import styles from '../../index.module.css';

type Props = {
    messagesRef: Ref<HTMLDivElement>;
    label: string;
    children: ReactNode;
};

export default function ChatMessages({ messagesRef, label, children }: Props) {
    return (
        <div
            ref={messagesRef}
            role="log"
            aria-label={label}
            aria-live="polite"
            aria-relevant="additions text"
            className={`${styles.messages} min-h-0 min-w-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain bg-transparent px-[var(--chat-gutter)] py-4 sm:py-6`}
        >
            {children}
        </div>
    );
}

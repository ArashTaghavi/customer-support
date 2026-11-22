import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';
import styles from '../message_history/message_history.module.css';

export default function AssistantMessage({
    children,
    fullWidth = false,
}: {
    children: ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <div
            className={`${styles.bubble} ${styles.assistant} mr-auto min-w-0 px-3 py-2.5 ${fullWidth ? 'w-full max-w-full' : 'w-fit max-w-[95%] sm:max-w-[90%]'}`}
        >
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                <span className="flex size-6 items-center justify-center rounded-lg border border-violet-200/15 bg-violet-300/10">
                    <Bot size={15} aria-hidden="true" className={styles.robot} />
                </span>
                پشتیبان
            </div>
            {children}
        </div>
    );
}

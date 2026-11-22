import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
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
            className={`${styles.bubble} ${styles.assistant} mr-auto min-w-0 rounded-3xl rounded-tl-md px-3 py-2.5 ${fullWidth ? 'w-full max-w-full' : 'w-fit max-w-[95%] sm:max-w-[90%]'}`}
        >
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                <span className="flex size-6 items-center justify-center rounded-lg border border-violet-200/15 bg-violet-300/10">
                    <Sparkles size={13} aria-hidden="true" />
                </span>
                پشتیبان
            </div>
            {children}
        </div>
    );
}

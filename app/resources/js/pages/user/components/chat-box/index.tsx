import styles from './chat-box.module.css';

type ChatBoxProps = {
    message: string;
    date: string;
    isUser: boolean;
};

export default function ChatBox({ message, date, isUser }: ChatBoxProps) {
    return (
        <div
            dir="rtl"
            className={`flex w-full ${isUser ? 'justify-start' : 'justify-end'}`}
        >
            <article
                aria-label={isUser ? 'پیام شما' : 'پاسخ هوش مصنوعی'}
                className={`${styles.bubble} ${isUser ? styles.user : styles.assistant} flex w-fit max-w-[95%] min-w-0 flex-col gap-2 px-3 py-2.5 text-foreground sm:max-w-[90%]`}
            >
                <p
                    dir="auto"
                    className="text-start text-sm leading-7 wrap-anywhere whitespace-pre-wrap"
                >
                    {message}
                </p>
                <span className="self-end text-xs text-muted">{date}</span>
            </article>
        </div>
    );
}

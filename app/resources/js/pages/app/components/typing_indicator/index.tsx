import styles from './typing_indicator.module.css';

export default function TypingIndicator() {
    return (
        <div
            role="status"
            className="flex items-center gap-3 py-1 text-xs text-sky-200/80"
        >
            <span>
                در حال نوشتن<span className="sr-only">…</span>
            </span>
            <span aria-hidden="true" className="flex items-center gap-1">
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
            </span>
        </div>
    );
}

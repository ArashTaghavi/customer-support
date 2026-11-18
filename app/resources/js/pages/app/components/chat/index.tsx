import styles from './chat.module.css';

export default function Chat() {
    return (
        <div className={`${styles.chat} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}>
            <span aria-hidden="true" className={styles.edgeShine} />
            <div className="min-h-0 flex-1 overflow-y-auto">گفتگو</div>
        </div>
    );
}


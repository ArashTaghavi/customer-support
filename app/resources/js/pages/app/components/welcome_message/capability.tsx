import type { LucideIcon } from 'lucide-react';
import styles from './capability.module.css';

type PropsType = {
    Icon: LucideIcon;
    title: string;
    description: string;
    color: string;
};

export default function Capability({
    Icon,
    title,
    description,
    color,
}: PropsType) {
    return (
        <div
            className={`${styles.card} group relative isolate overflow-hidden rounded-2xl p-4 sm:p-5 [@media(max-height:700px)]:p-3`}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-ambient"
            />
            <div className="flex items-center gap-2">
                <span
                    className={`${styles.icon} flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-outline/15 ring-inset [@media(max-height:700px)]:size-8 ${color}`}
                >
                    <Icon size={18} aria-hidden="true" />
                </span>

                <h3 className="text-xs leading-6 font-medium text-foreground sm:text-sm [@media(max-height:700px)]:text-xs [@media(max-height:700px)]:leading-5">
                    {title}
                </h3>
            </div>

            <p className="mt-3 text-xs leading-6 text-secondary [@media(max-height:700px)]:mt-1 [@media(max-height:700px)]:text-[11px] [@media(max-height:700px)]:leading-5">
                {description}
            </p>
        </div>
    );
}

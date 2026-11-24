import type { ReactNode } from 'react';

export type StatusTone =
    'success' | 'warning' | 'danger' | 'info' | 'processing' | 'neutral';
const colors: Record<StatusTone, string> = {
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    danger: 'border-danger/20 bg-danger/10 text-danger',
    info: 'border-info/20 bg-info/10 text-info',
    processing: 'border-processing/20 bg-processing/10 text-processing',
    neutral: 'border-ui-border bg-highlight/5 text-ui-secondary',
};

export default function StatusBadge({
    children,
    tone = 'neutral',
}: {
    children: ReactNode;
    tone?: StatusTone;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium whitespace-nowrap ${colors[tone]}`}
        >
            <span
                className="size-1.5 rounded-full bg-current"
                aria-hidden="true"
            />
            {children}
        </span>
    );
}

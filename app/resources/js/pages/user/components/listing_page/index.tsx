import styles from '../../../auth/components/login_card/login_card.module.css';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    description: ReactNode;
    icon: LucideIcon;
    children: ReactNode;
    footer: ReactNode;
};

export default function ListingPage({
    title,
    description,
    icon: Icon,
    children,
    footer,
}: Props) {
    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col overflow-hidden">
            <Head title={title} />
            <header className="relative z-1 flex shrink-0 items-center gap-3 px-4 pt-16 pb-5 sm:px-6 lg:pt-7">
                <div
                    aria-hidden="true"
                    className={`${styles.edgeShine} pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden bg-linear-to-r from-transparent via-highlight to-transparent shadow-glass`}
                />
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-glow/10 text-foreground">
                    <Icon size={23} aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-xl font-semibold text-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-xs leading-6 text-secondary">
                        {description}
                    </p>
                </div>
            </header>
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
                {children}
            </div>
            {footer}
        </div>
    );
}

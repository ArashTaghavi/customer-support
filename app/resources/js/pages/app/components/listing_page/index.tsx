import styles from '../../../auth/components/login_card/login_card.module.css';
﻿import { Head } from '@inertiajs/react';
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
                <div aria-hidden="true" className={`${styles.edgeShine} pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden bg-linear-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_18px_2px_#8b5cf670]`} />
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                    <Icon size={23} aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        {title}
                    </h1>
                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                        {description}
                    </p>
                </div>
            </header>
            <div className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(167,139,250,0.2)_transparent] space-y-7 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
                {children}
            </div>
            {footer}
        </div>
    );
}

import { Button } from '@/components/ui';
import { useState } from 'react';
import styles from './header.module.css';

export default function Header() {
    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : false,
    );

    function toggleTheme() {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle('dark', nextIsDark);
        setIsDark(nextIsDark);
    }

    return (
        <header
            className={`${styles.header} grid min-h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 px-6`}
        >
            <span className="text-lg font-semibold text-foreground">
                پشتیبانی مشتریان
            </span>
            <nav aria-label="ناوبری اصلی" className="flex items-center gap-6">
                <Button
                    type="button"
                    variant="tab"
                    size="sm"
                    className="rounded text-sm font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    خانه
                </Button>
                <Button
                    type="button"
                    variant="tab"
                    size="sm"
                    className="rounded text-sm font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    فروشگاه
                </Button>
            </nav>
            <div className="flex items-center gap-3 justify-self-end">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={toggleTheme}
                    aria-label="حالت تاریک"
                    aria-pressed={isDark}
                    className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    {isDark ? 'حالت روشن' : 'حالت تاریک'}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    ورود
                </Button>
            </div>
        </header>
    );
}

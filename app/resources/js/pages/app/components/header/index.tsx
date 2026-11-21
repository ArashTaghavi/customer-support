import { Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import styles from './header.module.css';
import { Headset, LogIn, Moon, Sun } from 'lucide-react';

export default function Header() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    function toggleTheme() {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle('dark', nextIsDark);
        setIsDark(nextIsDark);
    }

    return (
        <header
            className={`${styles.header} grid min-h-14 min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-white/5 px-3 sm:min-h-16 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4`}
        >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                <Headset
                    size={20}
                    className="shrink-0 text-brand"
                    aria-hidden="true"
                />
                <span className="truncate">پشتیبانی مشتریان</span>
            </span>
            <nav
                aria-label="ناوبری اصلی"
                className="hidden items-center gap-2 md:flex"
            >
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
            <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={toggleTheme}
                    aria-label={
                        isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'
                    }
                    aria-pressed={isDark}
                    className="size-9! rounded-xl! border-border! p-0! text-foreground sm:h-9! sm:w-auto! sm:px-3!"
                >
                    {isDark ? (
                        <Sun size={16} aria-hidden="true" />
                    ) : (
                        <Moon size={16} aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">
                        {isDark ? 'حالت روشن' : 'حالت تاریک'}
                    </span>
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="h-9! rounded-xl! px-3! text-xs!"
                    startIcon={<LogIn size={15} aria-hidden="true" />}
                >
                    ورود
                </Button>
            </div>
        </header>
    );
}

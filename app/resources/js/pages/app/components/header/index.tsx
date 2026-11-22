import { Button } from '@/components/ui';
import styles from './header.module.css';
import { Headset, LogIn } from 'lucide-react';

export default function Header() {
    return (
        <header
            className={`${styles.header} grid min-h-14 min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-white/5 px-3 sm:min-h-16 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4`}
        >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-100 sm:text-base">
                <Headset
                    size={20}
                    className="shrink-0 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
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
                    className="rounded-xl! text-sm font-medium text-zinc-400! hover:bg-violet-400/10! hover:text-violet-100! focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    خانه
                </Button>
                <Button
                    type="button"
                    variant="tab"
                    size="sm"
                    className="rounded-xl! text-sm font-medium text-zinc-400! hover:bg-violet-400/10! hover:text-violet-100! focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    فروشگاه
                </Button>
            </nav>
            <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-3">
                <Button
                    type="button"
                    size="sm"
                    className="h-9! rounded-xl! border-violet-300/25! bg-linear-to-l from-violet-600 to-violet-700 px-3! text-xs! shadow-[0_3px_14px_rgba(124,58,237,0.25)]"
                    startIcon={<LogIn size={15} aria-hidden="true" />}
                >
                    ورود
                </Button>
            </div>
        </header>
    );
}

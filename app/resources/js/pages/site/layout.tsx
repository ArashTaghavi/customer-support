import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, type ReactNode } from 'react';
import AiPointer, { type AiPointerHandle } from './components/ai_pointer';
import { ShoppingBag, UserRound } from 'lucide-react';
import { login, shop } from '@/routes';
import { index as panel } from '@/routes/app';
import Cart from '../user/components/cart';
import './site.css';
import CommandWidget from './components/command_widget';

export default function SiteLayout({ children }: { children: ReactNode }) {
    const pointer = useRef<AiPointerHandle>(null);

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(() => {
            async function preview() {
                await pointer.current?.moveTo({
                    x: Math.min(110, window.innerWidth - 40),
                    y: Math.max(100, window.innerHeight - 200),
                });
                if (!cancelled) await pointer.current?.click();
            }
            void preview();
        }, 400);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, []);
    const page = usePage<{ auth: { user: unknown | null } }>();

    return (
        <div dir="rtl" lang="fa" className="site-theme flex h-dvh flex-col overflow-hidden bg-canvas text-foreground">
            <header className="site-header relative z-10 shrink-0">
                <nav aria-label="ناوبری سایت" className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-6 sm:px-6 sm:py-4">
                    <Link href={shop()} className="site-logo flex min-w-0 shrink-0 items-center gap-3 rounded-xl">
                        <span className="site-logo-mark flex size-11 items-center justify-center rounded-2xl sm:size-12">
                            <ShoppingBag size={23} strokeWidth={1.6} aria-hidden="true" />
                        </span>
                        <span className="flex flex-col gap-0.5">
                            <span className="text-base font-bold tracking-tight sm:text-lg">فروشگاه</span>
                            <span className="text-[10px] font-normal text-muted sm:text-xs">تجربه‌ای متفاوت از انتخاب</span>
                        </span>
                    </Link>
                    <Link href={shop()} aria-current={page.component === 'site/shop/index' ? 'page' : undefined} className="site-nav-link hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm md:inline-flex">
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                        همه محصولات
                    </Link>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {page.props.auth.user ? <Cart variant="header" /> : null}
                        <Link href={page.props.auth.user ? panel() : login()} className="site-account inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium sm:px-4 sm:text-sm">
                            <UserRound size={17} aria-hidden="true" />
                            <span>{page.props.auth.user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}</span>
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="min-h-0 flex-1">{children}</main>
            <CommandWidget />
            <AiPointer ref={pointer} />
        </div>
    );
}

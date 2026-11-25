import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';
import { login, shop } from '@/routes';
import { index as panel } from '@/routes/app';
import Cart from '../user/components/cart';
import './site.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<{ auth: { user: unknown | null } }>().props;

    return (
        <div dir="rtl" lang="fa" className="site-theme flex h-dvh flex-col overflow-hidden bg-canvas text-foreground">
            <header className="shrink-0 border-b border-border bg-surface">
                <nav aria-label="ناوبری سایت" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <Link href={shop()} className="flex items-center gap-3 text-lg font-semibold">
                        <ShoppingBag size={22} aria-hidden="true" />
                        فروشگاه
                    </Link>
                    <div className="flex items-center gap-3">
                        {auth.user ? <div className="max-w-40"><Cart /></div> : null}
                        <Link href={auth.user ? panel() : login()} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-hover">
                            {auth.user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="min-h-0 flex-1">{children}</main>
        </div>
    );
}

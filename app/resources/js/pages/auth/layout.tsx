import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { index as home } from '@/routes/app';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main
            dir="rtl"
            lang="fa"
            className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-canvas px-5 py-12 font-sans text-foreground selection:bg-primary/30"
        >
            <div className="w-full max-w-[420px]">
                {children}
                <Link
                    href={home()}
                    className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-xs text-secondary transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight"
                >
                    <ArrowLeft size={14} aria-hidden="true" />
                    بازگشت به صفحه اصلی
                </Link>
            </div>
        </main>
    );
}

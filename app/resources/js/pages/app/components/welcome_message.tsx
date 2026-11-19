import { useEffect, useState } from 'react';
import { Headset, PackageSearch, ShoppingCart, XCircle } from 'lucide-react';

const capabilities = [
    {
        icon: PackageSearch,
        title: 'پیگیری و مدیریت سفارش',
        description: 'وضعیت سفارش‌هات رو ببین و برای تغییراتشون اقدام کن.',
        color: 'text-violet-300 bg-violet-400/10',
    },
    {
        icon: ShoppingCart,
        title: 'جستجوی کالا و خرید',
        description: 'کالاها رو همین‌جا جستجو کن و به سبد خریدت اضافه کن.',
        color: 'text-sky-300 bg-sky-400/10',
    },
    {
        icon: XCircle,
        title: 'درخواست لغو سفارش',
        description: 'درخواست لغو بده تا امکان لغو سفارشت بررسی بشه.',
        color: 'text-rose-300 bg-rose-400/10',
    },
    {
        icon: Headset,
        title: 'ارتباط با پشتیبانی',
        description: 'هر وقت نیاز داشتی، با پشتیبانی انسانی صحبت کن.',
        color: 'text-emerald-300 bg-emerald-400/10',
    },
];

export default function WelcomeMessage() {
    const greeting = 'سلام! چطوری می‌تونم کمکت کنم؟';
    const [length, setLength] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setLength((current) => Math.min(current + 1, greeting.length));
        }, 60);

        const timeout = window.setTimeout(
            () => {
                window.clearInterval(timer);
            },
            greeting.length * 60 + 100,
        );

        return () => {
            window.clearInterval(timer);
            window.clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            dir="rtl"
            className="@container flex h-full min-h-0 w-full items-center justify-center px-3 py-3 sm:px-6 [@media(max-height:700px)]:py-1"
        >
            <div className="w-full max-w-2xl">
                <div className="text-center">
                    <span
                        aria-hidden="true"
                        className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl border border-violet-200/25 bg-linear-to-br from-violet-300/20 to-indigo-500/5 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_32px_rgba(139,92,246,0.15)] backdrop-blur-xl [@media(max-height:700px)]:mb-2 [@media(max-height:700px)]:size-10 [@media(max-height:700px)]:text-2xl"
                    >
                        👋
                    </span>

                    <h2
                        aria-label={greeting}
                        className="relative text-xl leading-9 font-semibold text-zinc-100 sm:text-2xl [@media(max-height:700px)]:text-lg [@media(max-height:700px)]:leading-7"
                    >
                        {/* فضای عنوان ثابت می‌ماند تا محتوا نپرد. */}
                        <span aria-hidden="true" className="invisible">
                            {greeting}
                        </span>

                        <span aria-hidden="true" className="absolute inset-0">
                            {greeting.slice(0, length)}
                            {length < greeting.length && (
                                <span className="ms-1 inline-block h-5 w-0.5 animate-pulse bg-violet-400 align-middle" />
                            )}
                        </span>
                    </h2>

                    <p className="mt-1 text-xs leading-6 text-zinc-400 sm:text-sm [@media(max-height:700px)]:text-xs">
                        از پیگیری سفارش تا پیدا کردن خرید بعدی، همین‌جا کنارتم.
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:gap-2">
                    {capabilities.map(
                        ({ icon: Icon, title, description, color }) => (
                            <div
                                key={title}
                                className="group relative isolate overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-white/10 via-white/[0.04] to-violet-300/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.025),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-violet-200/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_28px_rgba(139,92,246,0.12)] sm:p-4 [@media(max-height:700px)]:p-2.5"
                            >
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.13),transparent_65%)]"
                                />
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 motion-safe:group-hover:translate-x-[550%]"
                                />
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10 ring-inset [@media(max-height:700px)]:size-7 ${color}`}
                                    >
                                        <Icon size={18} aria-hidden="true" />
                                    </span>

                                    <h3 className="text-xs leading-6 font-medium text-zinc-100 sm:text-sm [@media(max-height:700px)]:text-xs [@media(max-height:700px)]:leading-5">
                                        {title}
                                    </h3>
                                </div>

                                <p className="mt-2 text-xs leading-6 text-zinc-300/80 [@media(max-height:700px)]:mt-1 [@media(max-height:700px)]:text-[11px] [@media(max-height:700px)]:leading-5">
                                    {description}
                                </p>
                            </div>
                        ),
                    )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-zinc-400 [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-[11px]">
                    مثلاً بنویس:
                    <span className="mr-1 text-violet-300">
                        «یه هدفون بی‌سیم می‌خوام»
                    </span>
                </p>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';

export default function Greeting() {
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
    );
}

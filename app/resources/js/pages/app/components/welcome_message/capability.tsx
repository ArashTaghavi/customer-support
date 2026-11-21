import type { LucideIcon } from 'lucide-react';

type PropsType = {
    Icon: LucideIcon;
    title: string;
    description: string;
    color: string;
};

export default function Capability({
    Icon,
    title,
    description,
    color,
}: PropsType) {
    return (
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
    );
}

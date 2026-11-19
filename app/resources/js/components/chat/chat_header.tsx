import { FileText } from 'lucide-react';

type Props = {
    title?: string;
    subtitle: string;
};

export default function ChatHeader({ title, subtitle }: Props) {
    return (
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#191923]/95 px-4 py-3 shadow-sm shadow-black/20 sm:px-6">
            <FileText size={24} className="shrink-0 text-violet-300" />
            <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium" title={title}>
                    {title ?? 'گفتگوی جدید'}
                </h2>
                <p className="text-ui-muted mt-1 text-xs">{subtitle}</p>
            </div>
        </header>
    );
}

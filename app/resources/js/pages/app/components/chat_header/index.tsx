import { FileText, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui';

type Props = {
    title?: string;
    subtitle: string;
    sidebarOpen: boolean;
    onOpenSidebar: () => void;
};

export default function ChatHeader({
    title,
    subtitle,
    sidebarOpen,
    onOpenSidebar,
}: Props) {
    return (
        <header className="flex min-w-0 shrink-0 items-center gap-2 border-b border-white/6 bg-[#101012] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_75%)] px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
            <Button
                variant="secondary"
                size="icon"
                className="lg:hidden"
                onClick={onOpenSidebar}
                aria-label="باز کردن فهرست گفتگوها"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-chat-sidebar"
            >
                <PanelRightOpen size={18} aria-hidden="true" />
            </Button>
            <FileText
                size={22}
                className="hidden shrink-0 text-violet-300 lg:block"
                aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium" title={title}>
                    {title ?? 'گفتگوی جدید'}
                </h2>
                <p className="mt-0.5 truncate text-[10px] text-zinc-500 sm:text-xs">
                    {subtitle}
                </p>
            </div>
        </header>
    );
}

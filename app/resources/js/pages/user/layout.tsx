import { useState, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui';
import ChatSidebar from './components/chat_sidebar';
import styles from './index.module.css';

type AppLayoutProps = { children: ReactNode };

export default function AppLayout({ children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isShop = usePage().component === 'user/shop/index';

    return (
        <div
            dir="rtl"
            className={`${styles.shell} flex h-dvh min-h-0 w-full min-w-0 overflow-hidden`}
        >
            <ChatSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div
                className={`${styles.content} ${isShop ? styles.shopContent : ''} relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas text-foreground`}
            >
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute start-3 top-3 z-10 size-11! lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="باز کردن سایدبار"
                    aria-expanded={sidebarOpen}
                    aria-controls="mobile-chat-sidebar"
                >
                    <PanelRightOpen size={18} aria-hidden="true" />
                </Button>
                <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
                    {children}
                </main>
            </div>
        </div>
    );
}

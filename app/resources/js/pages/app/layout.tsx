import type { ReactNode } from 'react';
import { Header, Sidebar } from './components';

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-dvh w-full flex-col overflow-hidden">
            <Header />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <aside className="flex w-72 shrink-0 flex-col overflow-y-auto bg-surface-secondary">
                    <Sidebar />
                </aside>
                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

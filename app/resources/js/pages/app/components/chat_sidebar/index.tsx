import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';
import {
    ChevronLeft,
    MessageCircle,
    MessageSquare,
    Plus,
    Search,
    LogOut,
    ShoppingBag,
    ReceiptText,
    X,
} from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';
import { show, store } from '@/routes/conversations';
import { logout, shop } from '@/routes';
import { index as ordersIndex } from '@/routes/orders';
import { messageDate } from '@/utils/message_dates';
import type { ConversationResponse } from '@/types/conversation';
import Cart from '../cart';
import Profile from '../profile';
import styles from '../../index.module.css';

type SidebarProps = { open: boolean; onClose: () => void };

function SidebarContent({
    onNavigate,
    mobile = false,
}: {
    onNavigate: () => void;
    mobile?: boolean;
}) {
    const { conversations, selectedConversation } = usePage<{
        conversations: ConversationResponse[];
        selectedConversation?: ConversationResponse;
    }>().props;

    const { auth } = usePage().props;
    const fullName = [auth.user.first_name, auth.user.last_name]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ');
    const currentPage = usePage().component;
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const searchId = useId();
    const filtered = conversations.filter((conversation) =>
        conversation.title
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
    );

    function newChat() {
        router.post(
            store.url(),
            {},
            {
                onStart: () => setCreating(true),
                onSuccess: () => onNavigate(),
                onFinish: () => setCreating(false),
            },
        );
    }

    return (
        <div className="sidebar-surface flex h-full min-h-0 flex-col text-foreground">
            <div className="shrink-0 space-y-4 border-b border-border/30 p-4">
                <div className="flex items-center gap-2.5">
                    <Profile />
                    <span
                        className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                        title={fullName}
                    >
                        {fullName}
                    </span>
                    <Button
                        variant="tab"
                        size="icon"
                        aria-label="خروج از حساب"
                        tooltip="خروج از حساب"
                        className="size-11! shrink-0 rounded-xl! text-danger! hover:bg-danger/10!"
                        disabled={loggingOut}
                        loading={loggingOut}
                        startIcon={<LogOut size={18} aria-hidden="true" />}
                        onClick={() => {
                            if (loggingOut) return;
                            router.post(
                                logout().url,
                                {},
                                {
                                    onStart: () => setLoggingOut(true),
                                    onFinish: () => setLoggingOut(false),
                                },
                            );
                        }}
                    />
                    {mobile && (
                        <Button
                            variant="tab"
                            size="icon"
                            onClick={onNavigate}
                            aria-label="بستن فهرست گفتگوها"
                        >
                            <X size={18} aria-hidden="true" />
                        </Button>
                    )}
                </div>
                <Button
                    fullWidth
                    size="sm"
                    loading={creating}
                    onClick={newChat}
                    startIcon={<Plus size={17} aria-hidden="true" />}
                    className="h-11! rounded-xl! border-0! font-medium!"
                >
                    گفتگوی جدید
                </Button>
                <div className="relative">
                    <label htmlFor={searchId} className="sr-only">
                        جستجو در گفتگوها
                    </label>
                    <Search
                        size={15}
                        className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted"
                        aria-hidden="true"
                    />
                    <input
                        id={searchId}
                        type="search"
                        autoComplete="off"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="جستجو در گفتگوها…"
                        className="h-11 w-full min-w-0 rounded-xl border border-border/40 bg-input ps-9 pe-3 text-base text-foreground outline-none placeholder:text-muted focus:border-outline/50 focus:ring-2 focus:ring-outline/10 sm:text-xs"
                    />
                </div>
            </div>
            <nav
                aria-label="تاریخچه گفتگوها"
                className="min-h-0 flex-1 scrollbar-thin overflow-y-auto overscroll-contain p-3"
            >
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] text-muted">
                    <span>گفتگوهای اخیر</span>
                    <span className="rounded-md border border-border/25 bg-highlight/3 px-1.5 py-0.5 tabular-nums">
                        {filtered.length.toLocaleString('fa-IR')}
                    </span>
                </div>
                <div className="space-y-1.5">
                    {filtered.map((conversation) => {
                        const active =
                            conversation.uuid === selectedConversation?.uuid;
                        const date = messageDate(conversation.created_at);
                        return (
                            <Link
                                key={conversation.uuid}
                                href={show.url(conversation.uuid)}
                                onClick={onNavigate}
                                aria-current={active ? 'page' : undefined}
                                className={`group relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-glow ${active ? 'border-outline/20 bg-linear-to-l from-primary/15 to-primary/5 shadow-sm shadow-black/10' : 'border-transparent hover:border-border/25 hover:bg-highlight/4'}`}
                            >
                                {active && (
                                    <span
                                        className="active-indicator absolute inset-y-3 right-0 w-0.5 rounded-full bg-glow"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-glow/10 text-highlight' : 'bg-highlight/3 text-muted group-hover:text-secondary'}`}
                                >
                                    <MessageSquare
                                        size={15}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span
                                        dir="auto"
                                        className={`block truncate text-start text-xs leading-5 ${active ? 'font-medium text-highlight' : 'text-secondary'}`}
                                    >
                                        {conversation.title || 'گفتگوی جدید'}
                                    </span>
                                    {date.iso && (
                                        <Tooltip content={date.full}>
                                            <time
                                                dateTime={date.iso}
                                                className="mt-1 block text-[10px] text-muted"
                                            >
                                                {new Date(
                                                    date.iso,
                                                ).toLocaleDateString('fa-IR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </time>
                                        </Tooltip>
                                    )}
                                </span>
                                <ChevronLeft
                                    size={13}
                                    className={`shrink-0 ${active ? 'text-highlight' : 'text-muted opacity-0 group-hover:opacity-100'}`}
                                    aria-hidden="true"
                                />
                            </Link>
                        );
                    })}
                </div>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                        <MessageCircle
                            size={28}
                            className="mb-1 text-highlight/40"
                            aria-hidden="true"
                        />
                        <p className="text-xs text-muted">
                            {search.trim()
                                ? 'گفتگویی پیدا نشد'
                                : 'هنوز گفتگویی ندارید'}
                        </p>
                        <p className="text-[11px] leading-6 text-muted">
                            {search.trim()
                                ? 'عبارت دیگری را جستجو کنید.'
                                : 'با یک سؤال، گفتگو را شروع کنید.'}
                        </p>
                    </div>
                )}
            </nav>
            <div className="mt-auto shrink-0 bg-transparent px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="mb-2 space-y-2">
                    {' '}
                    {[
                        {
                            label: 'فروشگاه',
                            href: shop(),
                            component: 'app/shop/index',
                            Icon: ShoppingBag,
                        },
                        {
                            label: 'سفارشات',
                            href: ordersIndex(),
                            component: 'app/orders/index',
                            Icon: ReceiptText,
                        },
                    ].map(({ label, href, component, Icon }) => (
                        <Tooltip key={component} content={label}>
                            <Link
                                href={href}
                                onClick={onNavigate}
                                aria-label={label}
                                aria-current={
                                    currentPage === component
                                        ? 'page'
                                        : undefined
                                }
                                className={`glass-nav group glass-nav flex h-12 w-full shrink-0 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-glow ${currentPage === component ? 'bg-glow/15 text-highlight' : 'text-muted hover:bg-glow/10 hover:text-highlight'}`}
                            >
                                <Icon size={18} aria-hidden="true" />
                                <span>{label}</span>
                            </Link>
                        </Tooltip>
                    ))}
                </div>
                <Cart />
            </div>
        </div>
    );
}

export default function ChatSidebar({ open, onClose }: SidebarProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1024px)');
        const closeOnDesktop = () => {
            if (media.matches) onClose();
        };
        media.addEventListener('change', closeOnDesktop);
        return () => media.removeEventListener('change', closeOnDesktop);
    }, [onClose]);

    return (
        <>
            <aside
                aria-label="گفتگوها"
                className={`${styles.sidebar} hidden h-full min-h-0 w-64 shrink-0 border-e border-border/40 lg:block 2xl:w-72`}
            >
                <SidebarContent onNavigate={onClose} />
            </aside>
            <dialog
                ref={dialogRef}
                data-sidebar="true"
                id="mobile-chat-sidebar"
                dir="rtl"
                aria-label="گفتگوهای شما"
                onClose={onClose}
                onClick={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
                className={`${styles.sidebar} fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(20rem,calc(100vw-1rem))] max-w-none border-0 border-e border-border/50 bg-sidebar p-0 text-foreground shadow-2xl shadow-black/50 backdrop:bg-black/65 backdrop:backdrop-blur-sm lg:hidden`}
            >
                <SidebarContent onNavigate={onClose} mobile />
            </dialog>
        </>
    );
}

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
        <div className="flex h-full min-h-0 flex-col bg-[#090909] text-zinc-100">
            <div className="shrink-0 space-y-4 border-b border-white/6 p-4">
                <div className="flex items-center gap-2.5">
                    <Profile />
                    <span className="flex-1" />
                    <Button
                        variant="tab"
                        size="icon"
                        aria-label="خروج از حساب"
                        tooltip="خروج از حساب"
                        className="size-11! shrink-0 rounded-xl! text-red-300! hover:bg-red-400/10!"
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
                    className="h-11! rounded-xl! font-medium!"
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
                        className="h-11 w-full min-w-0 rounded-xl border border-white/8 bg-black/20 ps-9 pe-3 text-base text-zinc-200 outline-none placeholder:text-muted focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 sm:text-xs"
                    />
                </div>
            </div>
            <nav
                aria-label="تاریخچه گفتگوها"
                className="min-h-0 flex-1 scrollbar-thin [scrollbar-color:rgba(167,139,250,0.2)_transparent] overflow-y-auto overscroll-contain p-3"
            >
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] text-muted">
                    <span>گفتگوهای اخیر</span>
                    <span className="rounded-md border border-white/5 bg-white/3 px-1.5 py-0.5 tabular-nums">
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
                                className={`group relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${active ? 'border-violet-300/20 bg-linear-to-l from-violet-500/15 to-indigo-500/5 shadow-sm shadow-black/10' : 'border-transparent hover:border-white/5 hover:bg-white/4'}`}
                            >
                                {active && (
                                    <span
                                        className="absolute inset-y-3 inset-s-0 w-0.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-violet-400/10 text-violet-300' : 'bg-white/3 text-muted group-hover:text-zinc-300'}`}
                                >
                                    <MessageSquare
                                        size={15}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span
                                        dir="auto"
                                        className={`block truncate text-start text-xs leading-5 ${active ? 'font-medium text-violet-100' : 'text-zinc-300'}`}
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
                                    className={`shrink-0 ${active ? 'text-violet-300' : 'text-muted opacity-0 group-hover:opacity-100'}`}
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
                            className="mb-1 text-violet-300/40"
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
            <div className="mt-auto shrink-0 bg-[#090909] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
<div className="mb-2 space-y-2">                    {[
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
                                className={`group flex h-12 w-full shrink-0 items-center gap-3 rounded-2xl border border-violet-300/35 bg-linear-to-br from-violet-500/15 via-violet-500/8 to-white/3 px-3 text-sm font-semibold shadow-[0_6px_24px_rgba(124,58,237,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${currentPage === component ? 'bg-violet-400/15 text-violet-200' : 'text-muted hover:bg-violet-400/10 hover:text-violet-200'}`}
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
                className={`${styles.sidebar} hidden h-full min-h-0 w-64 shrink-0 border-e border-white/8 lg:block 2xl:w-72`}
            >
                <SidebarContent onNavigate={onClose} />
            </aside>
            <dialog
                ref={dialogRef}
                id="mobile-chat-sidebar"
                dir="rtl"
                aria-label="گفتگوهای شما"
                onClose={onClose}
                onClick={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
                className={`${styles.sidebar} fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(20rem,calc(100vw-1rem))] max-w-none border-0 border-e border-white/10 bg-[#090909] p-0 text-zinc-100 shadow-2xl shadow-black/50 backdrop:bg-black/65 backdrop:backdrop-blur-sm lg:hidden`}
            >
                <SidebarContent onNavigate={onClose} mobile />
            </dialog>
        </>
    );
}

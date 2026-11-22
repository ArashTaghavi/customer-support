import { useHttp } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Check, ShieldQuestion, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { confirmCancelOrder } from '@/routes/messages';
import { invalidateCachedRequests } from '@/utils/request_cache';
import type { ChatResponse } from '@/types/chat_response';
import { parseChatResponse } from './parse_response';

type Props = {
    messageId: number;
    confirmation: NonNullable<ChatResponse['confirmation']>;
    onAnswer: (answer: ChatResponse) => void;
};

export default function CancellationConfirmation({
    messageId,
    confirmation,
    onAnswer,
}: Props) {
    const busy = useRef(false);
    const [error, setError] = useState('');
    const { post, transform, processing } = useHttp<
        { confirmed: boolean; interrupt_id: string },
        { answer: ChatResponse }
    >({ confirmed: false, interrupt_id: confirmation.interrupt_id });

    async function respond(confirmed: boolean) {
        if (busy.current) return;
        busy.current = true;
        setError('');
        transform((data) => ({ ...data, confirmed }));

        try {
            const response = await post(confirmCancelOrder.url(messageId));
            const answer = parseChatResponse(response?.answer);
            if (!answer) throw new Error('Invalid cancellation response');

            invalidateCachedRequests((key) => {
                const [, type] = JSON.parse(key) as [unknown, string];
                return type === 'orders';
            });
            window.dispatchEvent(new Event('chat-orders-changed'));
            onAnswer(answer);
        } catch {
            setError(
                'ثبت پاسخ انجام نشد. دوباره تلاش کنید؛ وضعیت سفارش را هم می‌توانید مجدداً بپرسید.',
            );
        } finally {
            busy.current = false;
        }
    }

    return (
        <section
            dir="rtl"
            aria-label="تأیید لغو سفارش"
            aria-busy={processing}
            className="min-w-0 space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"
        >
            <h3 className="flex items-center gap-2 text-sm font-medium text-amber-200">
                <ShieldQuestion size={18} aria-hidden="true" />
                تأیید لغو سفارش
            </h3>
            <p className="text-xs leading-7 wrap-anywhere text-zinc-200">
                {confirmation.message}
            </p>
            <p className="text-xs text-muted">
                مبلغ سفارش:{' '}
                <span className="tabular-nums">
                    {confirmation.total_amount.toLocaleString('fa-IR')} تومان
                </span>
            </p>
            <p className="text-[11px] leading-6 text-muted">
                تا تأیید نکنید، سفارش لغو نمی‌شود. بازگشت وجه فرایند جداگانه‌ای
                دارد.
            </p>
            {error && (
                <p role="alert" className="text-xs leading-6 text-rose-300">
                    {error}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="danger"
                    size="sm"
                    disabled={processing}
                    onClick={() => void respond(true)}
                    startIcon={<Check size={14} aria-hidden="true" />}
                >
                    تأیید لغو سفارش
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={processing}
                    onClick={() => void respond(false)}
                    startIcon={<X size={14} aria-hidden="true" />}
                >
                    سفارش را نگه دار
                </Button>
            </div>
        </section>
    );
}

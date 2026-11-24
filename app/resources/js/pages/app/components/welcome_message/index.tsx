import { Headset, PackageSearch, ShoppingCart, XCircle } from 'lucide-react';
import Greeting from './greeting';
import Capability from './capability';

const capabilities = [
    {
        icon: PackageSearch,
        title: 'پیگیری و مدیریت سفارش',
        description: 'وضعیت سفارش‌هات رو ببین و برای تغییراتشون اقدام کن.',
        color: 'text-highlight bg-glow/10',
    },
    {
        icon: ShoppingCart,
        title: 'جستجوی کالا و خرید',
        description: 'کالاها رو همین‌جا جستجو کن و به سبد خریدت اضافه کن.',
        color: 'text-highlight bg-glow/10',
    },
    {
        icon: XCircle,
        title: 'درخواست لغو سفارش',
        description: 'درخواست لغو بده تا امکان لغو سفارشت بررسی بشه.',
        color: 'text-highlight bg-glow/10',
    },
    {
        icon: Headset,
        title: 'ارتباط با پشتیبانی',
        description: 'هر وقت نیاز داشتی، با پشتیبانی انسانی صحبت کن.',
        color: 'text-highlight bg-glow/10',
    },
];

export default function WelcomeMessage({
    animated = false,
}: {
    animated?: boolean;
}) {
    return (
        <div
            dir="rtl"
            data-chat-welcome="true"
            className="@container relative isolate flex min-h-full w-full items-center justify-center overflow-hidden px-1 py-3 sm:px-6 [@media(max-height:700px)]:py-1"
        >
            <div className="w-full max-w-2xl">
                <Greeting animated={animated} />

                <div className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:gap-2">
                    {capabilities.map(
                        ({ icon: Icon, title, description, color }) => (
                            <Capability
                                key={title}
                                Icon={Icon}
                                title={title}
                                description={description}
                                color={color}
                            />
                        ),
                    )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-muted [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-[11px]">
                    مثلاً بنویس:
                    <span className="mr-1 text-highlight">
                        «یه هدفون بی‌سیم می‌خوام»
                    </span>
                </p>
            </div>
        </div>
    );
}

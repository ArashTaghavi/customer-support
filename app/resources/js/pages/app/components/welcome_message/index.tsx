import { Headset, PackageSearch, ShoppingCart, XCircle } from 'lucide-react';
import Greeting from './greeting';
import Capability from './capability';

const capabilities = [
    {
        icon: PackageSearch,
        title: 'پیگیری و مدیریت سفارش',
        description: 'وضعیت سفارش‌هات رو ببین و برای تغییراتشون اقدام کن.',
        color: 'text-violet-300 bg-violet-400/10',
    },
    {
        icon: ShoppingCart,
        title: 'جستجوی کالا و خرید',
        description: 'کالاها رو همین‌جا جستجو کن و به سبد خریدت اضافه کن.',
        color: 'text-sky-300 bg-sky-400/10',
    },
    {
        icon: XCircle,
        title: 'درخواست لغو سفارش',
        description: 'درخواست لغو بده تا امکان لغو سفارشت بررسی بشه.',
        color: 'text-rose-300 bg-rose-400/10',
    },
    {
        icon: Headset,
        title: 'ارتباط با پشتیبانی',
        description: 'هر وقت نیاز داشتی، با پشتیبانی انسانی صحبت کن.',
        color: 'text-emerald-300 bg-emerald-400/10',
    },
];

export default function WelcomeMessage() {
    return (
        <div
            dir="rtl"
            className="@container flex h-full min-h-0 w-full items-center justify-center px-3 py-3 sm:px-6 [@media(max-height:700px)]:py-1"
        >
            <div className="w-full max-w-2xl">
                <Greeting />

                <div className="mt-5 grid grid-cols-2 gap-3 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:gap-2">
                    {capabilities.map(
                        ({ icon: Icon, title, description, color }) => (
                            <Capability
                                Icon={Icon}
                                title={title}
                                description={description}
                                color={color}
                            />
                        ),
                    )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-zinc-400 [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-[11px]">
                    مثلاً بنویس:
                    <span className="mr-1 text-violet-300">
                        «یه هدفون بی‌سیم می‌خوام»
                    </span>
                </p>
            </div>
        </div>
    );
}

import { Headset, PackageSearch, ShoppingCart, XCircle } from 'lucide-react';
import Greeting from './greeting';
import Capability from './capability';

const capabilities = [
    {
        icon: PackageSearch,
        title: 'Track your orders',
        description: 'View order status and manage your purchases.',
        color: 'text-foreground bg-glow/10',
    },
    {
        icon: ShoppingCart,
        title: 'Find products',
        description: 'Find products and add them to your cart.',
        color: 'text-foreground bg-glow/10',
    },
    {
        icon: XCircle,
        title: 'Cancel an order',
        description: 'Check whether your order can be cancelled.',
        color: 'text-foreground bg-glow/10',
    },
    {
        icon: Headset,
        title: 'Contact support',
        description: 'Get help from our support team whenever you need it.',
        color: 'text-foreground bg-glow/10',
    },
];

export default function WelcomeMessage({
    animated = false,
}: {
    animated?: boolean;
}) {
    return (
        <div
            dir="ltr"
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
                    Try asking:
                    <span className="ms-1 text-foreground">
                        “Help me find wireless headphones”
                    </span>
                </p>
            </div>
        </div>
    );
}

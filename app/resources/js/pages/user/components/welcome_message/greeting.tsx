import Typewriter from '@/components/Typewriter';
import { typingText, type TypingSegment } from '@/components/TypingTimeline';

const title = 'How can I help you today?';
const description: readonly TypingSegment[] = [
    {
        text: 'Track an order, find a product, or get help with your purchase. ',
    },
    { text: 'Ask a question and we will take it from there.' },
];

export default function Greeting({ animated = false }: { animated?: boolean }) {
    if (!animated) {
        return (
            <div className="text-center">
                <h2 className="text-xl leading-9 font-semibold text-foreground sm:text-2xl [@media(max-height:700px)]:text-lg [@media(max-height:700px)]:leading-7">
                    {title}
                </h2>
                <p className="mt-1 text-xs leading-6 text-muted sm:text-sm [@media(max-height:700px)]:text-xs">
                    {typingText(description)}
                </p>
            </div>
        );
    }
    return <Typewriter title={title} description={description} />;
}

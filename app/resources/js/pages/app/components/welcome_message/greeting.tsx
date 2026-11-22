import Typewriter from '@/components/Typewriter';
import { typingText, type TypingSegment } from '@/components/TypingTimeline';

const title = 'سلام! چطوری می‌تونم کمکت کنم؟';
const description: readonly TypingSegment[] = [
    {
        text: 'من اینجام تا خریدت راحت‌تر پیش بره. می‌خوای سفراشت',
        correction: 'من اینجام تا خریدت راحت‌تر پیش بره. می‌خوای سفارشت',
    },
    {
        text: ' رو پیگیری کنی، یه محصول پیدا کنی یا قبل از خرید بیشتر بدونی؟ هر سؤالی داری بنویس؛ با هم برسی',
        correction:
            ' رو پیگیری کنی، یه محصول پیدا کنی یا قبل از خرید بیشتر بدونی؟ هر سؤالی داری بنویس؛ با هم بررسی',
    },
    { text: ' می‌کنیم و قدم‌به‌قدم جلو می‌ریم.' },
];

export default function Greeting({ animated = false }: { animated?: boolean }) {
    if (!animated) {
        return (
            <div className="text-center">
                <h2 className="text-xl leading-9 font-semibold text-zinc-100 sm:text-2xl [@media(max-height:700px)]:text-lg [@media(max-height:700px)]:leading-7">
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

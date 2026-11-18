import ChatBox from '../chat-box';
import styles from './chat.module.css';

const messages = [
    {
        id: 1,
        message: 'سلام، می‌خوام وضعیت سفارشم رو بدونم.',
        date: '۱۴:۳۰',
        isUser: true,
    },
    {
        id: 2,
        message: 'سلام! شماره سفارشت رو می‌فرستی تا بررسی کنم؟',
        date: '۱۴:۳۰',
        isUser: false,
    },
    {
        id: 3,
        message: 'شماره سفارشم ۱۲۴۵۶ هست. دیروز ثبتش کردم.',
        date: '۱۴:۳۱',
        isUser: true,
    },
    {
        id: 4,
        message:
            'این یک پاسخ نمونه برای نمایش چت است.\nسفارش ۱۲۴۵۶ در حال آماده‌سازی است و بعد از ارسال، کد رهگیری در جزئیات سفارش نمایش داده می‌شود.',
        date: '۱۴:۳۱',
        isUser: false,
    },
    {
        id: 5,
        message: 'ممنون، پس منتظر کد رهگیری می‌مونم.',
        date: '۱۴:۳۲',
        isUser: true,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
    {
        id: 6,
        message: 'خواهش می‌کنم! اگر سؤال دیگه‌ای داشتی، همین‌جا بپرس.',
        date: '۱۴:۳۲',
        isUser: false,
    },
];

export default function Chat() {
    return (
        <div
            className={`${styles.chat} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
        >
            <span className={styles.edgeShine} />
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mx-auto flex flex-col gap-6">
                    {messages.map(({ id, ...message }) => (
                        <ChatBox key={id} {...message} />
                    ))}
                </div>
            </div>
            <div className="flex w-full">
                <input className="flex-1 rounded-b-md bg-amber-50 p-2" />
            </div>
        </div>
    );
}

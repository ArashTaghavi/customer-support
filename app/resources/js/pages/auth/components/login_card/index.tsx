import { useEffect, useRef, useState } from 'react';
import LoginForm from '../login_form';
import styles from './login_card.module.css';

export default function LoginCard() {
    const [confirmed, setConfirmed] = useState(false);
    const mounted = useRef(true);
    const delay = useRef<{
        timer: ReturnType<typeof setTimeout>;
        resolve: () => void;
    } | null>(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            if (delay.current) {
                clearTimeout(delay.current.timer);
                delay.current.resolve();
            }
        };
    }, []);

    function pause(milliseconds: number): Promise<void> {
        return new Promise((resolve) => {
            delay.current = {
                timer: setTimeout(resolve, milliseconds),
                resolve,
            };
        });
    }

    async function confirmAuthentication(): Promise<void> {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        await pause(reducedMotion ? 0 : 180);
        if (!mounted.current) {
            return;
        }
        setConfirmed(true);
        await pause(reducedMotion ? 200 : 1000);
        delay.current = null;
    }

    return (
        <>
            <section
                aria-labelledby="login-title"
                className={`${styles.card} glass-card relative overflow-hidden rounded-3xl px-6 py-9 shadow-glass! backdrop-blur-md sm:px-10 sm:py-10`}
            >
                <div
                    aria-hidden="true"
                    className={`${styles.edgeShine} pointer-events-none absolute inset-x-6 top-0 h-px overflow-hidden bg-linear-to-r from-transparent via-highlight to-transparent shadow-glass`}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 -top-16 h-32 rounded-full bg-primary/20 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className={`${styles.lock} ${confirmed ? `${styles.unlocked} ${styles.confirmed}` : ''} mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-outline/20 bg-glow/10 text-foreground shadow-glass`}
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path
                            className={styles.shackle}
                            d="M7 11V7a5 5 0 0 1 10 0v4"
                        />
                        <rect x="4" y="11" width="16" height="11" rx="2.5" />

                        {confirmed ? (
                            <path className={styles.check} d="m8 16 3 3 5-5" />
                        ) : (
                            <>
                                <circle cx="12" cy="16" r="1" />
                                <path d="M12 17v2" />
                            </>
                        )}
                    </svg>
                </div>
                <h1
                    id="login-title"
                    className="text-center text-2xl leading-relaxed font-semibold tracking-tight sm:text-[28px]"
                >
                    خوش آمدید
                </h1>
                <span role="status" className="sr-only">
                    {confirmed ? 'احراز هویت موفق بود. در حال انتقال…' : ''}
                </span>
                <LoginForm onAuthenticated={confirmAuthentication} />
            </section>
        </>
    );
}

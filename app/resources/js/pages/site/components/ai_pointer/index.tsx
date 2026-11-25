import { forwardRef, useImperativeHandle } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';

export type PointerPosition = { x: number; y: number };

export type AiPointerHandle = {
    moveTo: (position: PointerPosition, duration?: number) => Promise<void>;
    moveToElement: (element: HTMLElement, duration?: number) => Promise<void>;
    /** Visual feedback only; does not dispatch a DOM click. */
    click: () => Promise<void>;
    hide: () => void;
};

const AiPointer = forwardRef<AiPointerHandle>(function AiPointer(_, ref) {
    const [scope, animate] = useAnimate<HTMLDivElement>();
    const reducedMotion = useReducedMotion();

    useImperativeHandle(ref, () => {
        async function moveTo({ x, y }: PointerPosition, duration = 0.65) {
            if (!scope.current || !Number.isFinite(x) || !Number.isFinite(y))
                return;
            await animate(
                scope.current,
                {
                    x: Math.max(0, Math.min(x, window.innerWidth - 32)),
                    y: Math.max(0, Math.min(y, window.innerHeight - 40)),
                    opacity: 1,
                },
                {
                    duration: reducedMotion ? 0 : Math.max(0, duration),
                    ease: [0.22, 1, 0.36, 1],
                },
            );
        }

        return {
            moveTo,
            async moveToElement(element, duration) {
                if (
                    !element.isConnected ||
                    element.getClientRects().length === 0
                )
                    return;
                element.scrollIntoView({
                    behavior: 'instant',
                    block: 'nearest',
                    inline: 'nearest',
                });
                const rect = element.getBoundingClientRect();
                await moveTo(
                    {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    },
                    duration,
                );
            },
            async click() {
                if (!scope.current) return;
                await Promise.all([
                    animate(
                        '.ai-pointer-arrow',
                        { scale: [1, 0.82, 1] },
                        { duration: reducedMotion ? 0 : 0.25 },
                    ),
                    animate(
                        '.ai-pointer-ripple',
                        { scale: [0.3, 1.6], opacity: [0.65, 0] },
                        { duration: reducedMotion ? 0 : 0.45 },
                    ),
                ]);
            },
            hide() {
                if (scope.current)
                    void animate(
                        scope.current,
                        { opacity: 0 },
                        { duration: reducedMotion ? 0 : 0.15 },
                    );
            },
        };
    }, [animate, reducedMotion, scope]);

    return (
        <div
            ref={scope}
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-[60] size-0 select-none"
            style={{ opacity: 0 }}
        >
            <span className="ai-pointer-ripple absolute -top-4 -left-4 size-8 rounded-full border-2 border-violet-400 bg-violet-400/20 opacity-0" />
            <svg
                className="ai-pointer-arrow relative h-10 w-8 origin-top-left drop-shadow-md"
                viewBox="0 0 32 40"
                fill="none"
            >
                <path
                    d="M2 2L4 31L11 24L17 37L23 34L17 21L28 20L2 2Z"
                    fill="#7c3aed"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
});

export default AiPointer;

import {
    cloneElement,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './tooltip.module.css';

type TriggerProps = HTMLAttributes<HTMLElement>;
export type TooltipProps = {
    content: ReactNode;
    children: ReactElement<TriggerProps>;
    side?: 'top' | 'bottom';
    delay?: number;
};

type Position = {
    left: number;
    top: number;
    arrow: number;
    side: 'top' | 'bottom';
};

export default function Tooltip({
    content,
    children,
    side = 'top',
    delay = 300,
}: TooltipProps) {
    const id = useId();
    const panel = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const hasContent =
        content !== null &&
        content !== undefined &&
        content !== '' &&
        content !== false;
    const open = anchor !== null && hasContent;

    function clearTimer() {
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
    }

    function close() {
        clearTimer();
        setAnchor(null);
        setPosition(null);
    }

    function show(element: HTMLElement, wait: number) {
        clearTimer();
        timer.current = setTimeout(() => {
            setPosition(null);
            setAnchor(element);
        }, wait);
    }

    function leave() {
        clearTimer();
        timer.current = setTimeout(close, 120);
    }

    useEffect(
        () => () => {
            if (timer.current !== null) clearTimeout(timer.current);
        },
        [],
    );

    useLayoutEffect(() => {
        if (!open || !anchor || !panel.current) return;
        const element = panel.current;
        element.showPopover?.();

        function place() {
            if (!anchor?.isConnected) {
                setAnchor(null);
                return;
            }
            const rect = anchor.getBoundingClientRect();
            const box = {
                width: element.offsetWidth,
                height: element.offsetHeight,
            };
            const gap = 10;
            const margin = 12;
            const above = rect.top - box.height - gap;
            const below = rect.bottom + gap;
            const chosen =
                side === 'top'
                    ? above >= margin ||
                      below + box.height > window.innerHeight - margin
                        ? 'top'
                        : 'bottom'
                    : below + box.height <= window.innerHeight - margin ||
                        above < margin
                      ? 'bottom'
                      : 'top';
            const left = Math.max(
                margin,
                Math.min(
                    rect.left + rect.width / 2 - box.width / 2,
                    window.innerWidth - box.width - margin,
                ),
            );
            const top = Math.max(
                margin,
                Math.min(
                    chosen === 'top' ? above : below,
                    window.innerHeight - box.height - margin,
                ),
            );
            setPosition({
                left,
                top,
                side: chosen,
                arrow: Math.max(
                    14,
                    Math.min(rect.left + rect.width / 2 - left, box.width - 14),
                ),
            });
        }

        function dismiss(event: KeyboardEvent) {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            setAnchor(null);
            setPosition(null);
        }

        function pointerDown() {
            setAnchor(null);
            setPosition(null);
        }

        place();
        const observer = new ResizeObserver(place);
        observer.observe(element);
        observer.observe(anchor);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        document.addEventListener('keydown', dismiss, true);
        document.addEventListener('pointerdown', pointerDown, true);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
            document.removeEventListener('keydown', dismiss, true);
            document.removeEventListener('pointerdown', pointerDown, true);
        };
    }, [open, anchor, content, side]);

    if (!hasContent) return children;

    return (
        <>
            {cloneElement(children, {
                title: undefined,
                'aria-describedby':
                    [children.props['aria-describedby'], open ? id : undefined]
                        .filter(Boolean)
                        .join(' ') || undefined,
                onPointerEnter: (event) => {
                    children.props.onPointerEnter?.(event);
                    if (event.pointerType !== 'touch')
                        show(event.currentTarget, delay);
                },
                onPointerLeave: (event) => {
                    children.props.onPointerLeave?.(event);
                    if (event.currentTarget.contains(document.activeElement))
                        return;
                    leave();
                },
                onFocus: (event) => {
                    children.props.onFocus?.(event);
                    if (event.currentTarget.matches(':focus-visible'))
                        show(event.currentTarget, 0);
                },
                onBlur: (event) => {
                    children.props.onBlur?.(event);
                    leave();
                },
                onPointerDown: (event) => {
                    children.props.onPointerDown?.(event);
                    close();
                },
            })}
            {open &&
                createPortal(
                    <div
                        id={id}
                        ref={panel}
                        popover="manual"
                        role="tooltip"
                        dir="auto"
                        data-side={position?.side ?? side}
                        onPointerEnter={clearTimer}
                        onPointerLeave={leave}
                        className={`${styles.panel} z-[9999] w-max max-w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border-0 bg-linear-to-br from-[#21192f] to-[#100d17] px-3 py-2 text-center text-xs leading-6 font-medium break-words text-violet-50 shadow-[0_8px_28px_#00000070,0_0_16px_#8b5cf61a,inset_0_1px_0_#ffffff0a]`}
                        style={{
                            position: 'fixed',
                            inset: 'auto',
                            margin: 0,
                            overflow: 'visible',
                            left: position?.left ?? 0,
                            top: position?.top ?? 0,
                            visibility: position ? 'visible' : 'hidden',
                        }}
                    >
                        {content}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute size-2 rotate-45 border-0 bg-[#181221]"
                            style={{
                                left: (position?.arrow ?? 14) - 4,
                                ...(position?.side === 'bottom'
                                    ? {
                                          top: -5,
                                      }
                                    : {
                                          bottom: -5,
                                      }),
                            }}
                        />
                    </div>,
                    anchor.closest('dialog[open]') ?? document.body,
                )}
        </>
    );
}

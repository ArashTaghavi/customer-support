import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useForm } from 'react-hook-form';
import { GripHorizontal, Send, Sparkles, Minus, Plus } from 'lucide-react';
import { Form, Input } from '@/components/form';
import { Button } from '@/components/ui';

type Props = { onCommand?: (command: string) => void | Promise<void> };
type Fields = { command: string };
type Position = { x: number; y: number };

export default function CommandWidget({ onCommand }: Props) {
    const methods = useForm<Fields>({ defaultValues: { command: '' } });
    const widget = useRef<HTMLElement>(null);
    const drag = useRef<{ pointer: number; dx: number; dy: number } | null>(
        null,
    );
    const [position, setPosition] = useState<Position | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [notice, setNotice] = useState('');
    const pending = methods.formState.isSubmitting;
    const hasCommand = !!methods.watch('command').trim();

    function constrain(x: number, y: number): Position {
        const rect = widget.current?.getBoundingClientRect();
        return {
            x: Math.max(
                8,
                Math.min(x, window.innerWidth - (rect?.width ?? 0) - 8),
            ),
            y: Math.max(
                8,
                Math.min(y, window.innerHeight - (rect?.height ?? 0) - 8),
            ),
        };
    }

    useEffect(() => {
        function resize() {
            setPosition((current) =>
                current ? constrain(current.x, current.y) : null,
            );
        }
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        setPosition((current) =>
            current ? constrain(current.x, current.y) : null,
        );
    }, [collapsed, notice]);

    function startDrag(event: PointerEvent<HTMLButtonElement>) {
        if (event.button !== 0 || !widget.current) return;
        const rect = widget.current.getBoundingClientRect();
        drag.current = {
            pointer: event.pointerId,
            dx: event.clientX - rect.left,
            dy: event.clientY - rect.top,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    async function submit({ command }: Fields) {
        const value = command.trim();
        if (!value || pending) return;
        if (!onCommand) {
            setNotice('اتصال به دستیار هنوز فعال نشده است.');
            return;
        }
        setNotice('');
        try {
            await onCommand(value);
            methods.reset();
        } catch {
            setNotice('ارسال انجام نشد؛ دوباره تلاش کنید.');
        }
    }

    return (
        <aside
            ref={widget}
            aria-label="دستیار سایت"
            className="site-command-widget"
            style={
                position
                    ? {
                          left: position.x,
                          top: position.y,
                          right: 'auto',
                          bottom: 'auto',
                      }
                    : undefined
            }
        >
            <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles size={16} aria-hidden="true" />
                </span>
                <span className="flex-1 text-xs font-semibold">
                    دستیار سایت
                </span>
                <button
                    type="button"
                    aria-label="جابه‌جایی دستیار؛ با کلیدهای جهت‌نما هم قابل جابه‌جایی است"
                    className="flex size-10 cursor-grab touch-none items-center justify-center rounded-lg text-muted hover:bg-primary/5 active:cursor-grabbing"
                    onPointerDown={startDrag}
                    onPointerMove={(event) => {
                        const current = drag.current;
                        if (current?.pointer === event.pointerId)
                            setPosition(
                                constrain(
                                    event.clientX - current.dx,
                                    event.clientY - current.dy,
                                ),
                            );
                    }}
                    onPointerUp={() => {
                        drag.current = null;
                    }}
                    onPointerCancel={() => {
                        drag.current = null;
                    }}
                    onLostPointerCapture={() => {
                        drag.current = null;
                    }}
                    onKeyDown={(event) => {
                        const moves: Record<string, [number, number]> = {
                            ArrowLeft: [-16, 0],
                            ArrowRight: [16, 0],
                            ArrowUp: [0, -16],
                            ArrowDown: [0, 16],
                        };
                        const move = moves[event.key];
                        const rect = widget.current?.getBoundingClientRect();
                        if (!move || !rect) return;
                        event.preventDefault();
                        setPosition(
                            constrain(rect.left + move[0], rect.top + move[1]),
                        );
                    }}
                >
                    <GripHorizontal size={18} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label={
                        collapsed ? 'باز کردن دستیار' : 'جمع کردن دستیار'
                    }
                    aria-expanded={!collapsed}
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-primary/5"
                >
                    {collapsed ? <Plus size={16} /> : <Minus size={16} />}
                </button>
            </div>
            {!collapsed && (
                <div className="p-3">
                    <Form
                        methods={methods}
                        onSubmit={submit}
                        isPending={pending}
                        className="flex items-end gap-2 [&>div]:min-w-0 [&>div]:flex-1 [&>div>label]:sr-only"
                    >
                        <Input<Fields>
                            name="command"
                            label="دستور شما"
                            placeholder="می‌خواهید چه کاری انجام دهید؟"
                            disabled={pending}
                            className="h-11! text-xs!"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!hasCommand || pending}
                            loading={pending}
                            aria-label="ارسال دستور"
                            className="size-11! rounded-xl!"
                            startIcon={<Send size={17} />}
                        />
                    </Form>
                    {notice && (
                        <p
                            role="status"
                            className="mt-2 text-xs leading-6 text-secondary"
                        >
                            {notice}
                        </p>
                    )}
                </div>
            )}
        </aside>
    );
}

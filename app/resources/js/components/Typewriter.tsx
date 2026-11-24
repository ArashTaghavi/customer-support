import { useEffect, useMemo, useRef, useState } from 'react';
import { MechanicalTypingSound } from './MechanicalTypingSound';
import {
    buildTypingTimeline,
    typingText,
    type TypingSegment,
} from './TypingTimeline';

type Props = { title: string; description: readonly TypingSegment[] };

export default function Typewriter({ title, description }: Props) {
    const frames = useMemo(
        () => buildTypingTimeline(title, description),
        [title, description],
    );
    const [frame, setFrame] = useState(frames[0]);
    const audio = useRef<MechanicalTypingSound | null>(null);
    const soundOn = useRef(false);
    const done = useRef(false);
    const finalDescription = typingText(description);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        let disposed = false;
        let loading = false;
        let player: MechanicalTypingSound;
        try {
            player = new MechanicalTypingSound();
        } catch {
            return;
        }
        audio.current = player;
        function enable() {
            if (disposed || done.current) return;
            void player.resume().catch(() => {});
            if (loading || soundOn.current) return;
            loading = true;
            void player
                .enable('typewriter')
                .then(() => {
                    if (!disposed) {
                        soundOn.current = true;
                        document.removeEventListener('pointerdown', enable);
                        document.removeEventListener('keydown', enable);
                    }
                })
                .catch(() => {})
                .finally(() => {
                    loading = false;
                });
        }
        document.addEventListener('pointerdown', enable);
        document.addEventListener('keydown', enable);
        enable();
        return () => {
            disposed = true;
            document.removeEventListener('pointerdown', enable);
            document.removeEventListener('keydown', enable);
            soundOn.current = false;
            audio.current = null;
            void player.close().catch(() => {});
        };
    }, [frames]);

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer: ReturnType<typeof setTimeout>;
        let next = 0;
        done.current = false;
        function advance() {
            if (document.hidden) return;
            if (motion.matches) {
                setFrame(frames[frames.length - 1]);
                done.current = true;
                audio.current?.stop();
                return;
            }
            const current = frames[next++];
            if (!current) return;
            setFrame(current);
            done.current = current.phase === 'done';
            if (soundOn.current && current.key)
                audio.current?.play(current.key);
            if (next < frames.length)
                timer = setTimeout(advance, frames[next].at - current.at);
        }
        function resume() {
            clearTimeout(timer);
            if (!document.hidden && !done.current)
                timer = setTimeout(advance, 100);
            if (motion.matches) advance();
        }
        timer = setTimeout(advance, 0);
        document.addEventListener('visibilitychange', resume);
        motion.addEventListener('change', resume);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', resume);
            motion.removeEventListener('change', resume);
        };
    }, [frames]);

    const caret = (
        <span className="ms-1 inline-block h-[1em] w-0.5 bg-highlight align-middle motion-safe:animate-pulse" />
    );
    return (
        <div className="text-center">
            <h2 className="relative text-xl leading-9 font-semibold tracking-tight text-foreground sm:text-3xl [@media(max-height:700px)]:text-lg [@media(max-height:700px)]:leading-7">
                <span className="sr-only">{title}</span>
                <span aria-hidden="true" className="invisible">
                    {title}
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                    {frame.title}
                    {frame.phase === 'title' && caret}
                </span>
            </h2>
            <p className="relative mt-2 text-xs leading-7 text-secondary sm:text-sm [@media(max-height:700px)]:text-xs [@media(max-height:700px)]:leading-6">
                <span className="sr-only">{finalDescription}</span>
                <span aria-hidden="true" className="invisible">
                    {finalDescription}
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                    {frame.description}
                    {frame.phase === 'description' && caret}
                </span>
            </p>
        </div>
    );
}

export type TypingSegment = { text: string; correction?: string };
export type TypingFrame = {
    at: number;
    title: string;
    description: string;
    phase: 'title' | 'description' | 'done';
    key?: 'type' | 'space' | 'erase';
};

export function typingText(segments: readonly TypingSegment[]) {
    return segments
        .map((segment) => segment.correction ?? segment.text)
        .join('');
}

export function buildTypingTimeline(
    title: string,
    segments: readonly TypingSegment[],
    random = Math.random,
) {
    const frames: TypingFrame[] = [
        { at: 0, title: '', description: '', phase: 'title' },
    ];
    let at = 400;
    let heading = '';
    let description = '';
    let phase: 'title' | 'description' = 'title';
    let burst = 0;
    let pace = 120;
    const push = (key?: TypingFrame['key']) =>
        frames.push({ at, title: heading, description, phase, key });
    function type(text: string) {
        for (const character of Array.from(text)) {
            if (burst-- <= 0) {
                burst = 3 + Math.floor(random() * 7);
                pace = 85 + random() * 100;
            }
            at +=
                pace +
                random() * 65 +
                (character === ' ' ? 60 + random() * 100 : 0);
            if (phase === 'title') heading += character;
            else description += character;
            const silent = /[\u200c\u200d\u200e\u200f\p{Mark}]/u.test(
                character,
            );
            push(silent ? undefined : character === ' ' ? 'space' : 'type');
            if (/[،؛,.!؟?]/.test(character)) at += 240 + random() * 300;
        }
    }
    type(title);
    at += 650;
    phase = 'description';
    push();
    for (const segment of segments) {
        type(segment.text);
        if (segment.correction === undefined) continue;
        const wrong = Array.from(segment.text);
        const correct = Array.from(segment.correction);
        let common = 0;
        while (
            common < wrong.length &&
            common < correct.length &&
            wrong[common] === correct[common]
        )
            common++;
        at += 450 + random() * 250;
        for (let index = wrong.length; index > common; index--) {
            at += 65 + random() * 45;
            description = Array.from(description).slice(0, -1).join('');
            push('erase');
        }
        at += 180 + random() * 160;
        type(correct.slice(common).join(''));
    }
    frames.push({ at: at + 350, title: heading, description, phase: 'done' });
    return frames;
}

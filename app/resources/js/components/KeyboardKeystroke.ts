import type { TypewriterKey } from './MechanicalTypingSound';

const rows = ['ضصثقفغعهخحجچ', 'شسیبلاتنمکگ', 'ظطزرذدپو'];

export function keyboardKeystroke(character: string) {
    if (/^[\s\u200c\u200d\u200e\u200f\p{Mark}]$/u.test(character)) {
        return character === ' '
            ? {
                  key: 'space' as TypewriterKey,
                  touch: { gain: 0.45, playbackRate: 1, pan: 0 },
              }
            : null;
    }
    const normalized = character.replace('ي', 'ی').replace('ك', 'ک');
    let row = rows.findIndex((letters) => letters.includes(normalized));
    let column = row >= 0 ? rows[row].indexOf(normalized) : -1;
    if (row < 0) {
        row = 1;
        column = (character.codePointAt(0) ?? 0) % rows[row].length;
    }
    const position = column / (rows[row].length - 1);
    return {
        key: 'type' as TypewriterKey,
        touch: {
            variant: (column * 5 + row * 7) % 12,
            gain: 0.88 + ((column * 3 + row) % 6) * 0.035,
            playbackRate: 0.97 + ((column + row * 3) % 7) * 0.01,
            pan: (position - 0.5) * 0.35,
        },
    };
}

export function messageDate(timestamp: string) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return { iso: '', full: '', time: '' };
    return {
        iso: date.toISOString(),
        full: date.toLocaleString('fa-IR'),
        time: date.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

export function groupMessagesByDay<T extends { created_at: string }>(
    turns: T[],
) {
    const groups: { day: string; label: string; turns: T[] }[] = [];
    for (const turn of turns) {
        const date = new Date(turn.created_at);
        const valid = !Number.isNaN(date.getTime());
        const day = valid
            ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            : 'unknown';
        let group = groups.find((item) => item.day === day);
        if (!group) {
            group = {
                day,
                label: valid ? date.toLocaleDateString('fa-IR') : '',
                turns: [],
            };
            groups.push(group);
        }
        group.turns.push(turn);
    }
    return groups;
}

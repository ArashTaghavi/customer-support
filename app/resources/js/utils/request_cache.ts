const cacheLifetime = 60_000;
const maximumEntries = 100;
const results = new Map<string, { value: unknown; expiresAt: number }>();
const pending = new Map<string, Promise<unknown>>();

export function cachedRequest<T>(
    key: string,
    load: () => Promise<T>,
): Promise<T> {
    const cached = results.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return Promise.resolve(cached.value as T);
    }

    const existing = pending.get(key);
    if (existing) return existing as Promise<T>;

    const request = Promise.resolve()
        .then(load)
        .then((value) => {
            for (const [entryKey, entry] of results) {
                if (entry.expiresAt <= Date.now()) results.delete(entryKey);
            }

            results.delete(key);
            results.set(key, { value, expiresAt: Date.now() + cacheLifetime });
            while (results.size > maximumEntries) {
                const oldest = results.keys().next().value;
                if (oldest !== undefined) results.delete(oldest);
            }

            return value;
        })
        .finally(() => {
            pending.delete(key);
        });

    pending.set(key, request);
    return request;
}

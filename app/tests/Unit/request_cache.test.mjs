import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(
    new URL('../../resources/js/utils/request_cache.ts', import.meta.url),
    'utf8',
);
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
    },
}).outputText;
let instance = 0;

async function freshCache() {
    return import(
        `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${instance++}`
    );
}

test('shares an in-flight request across consumers', async () => {
    const { cachedRequest } = await freshCache();
    let calls = 0;
    let finish;
    const load = () => {
        calls++;
        return new Promise((resolve) => {
            finish = resolve;
        });
    };

    const first = cachedRequest('orders:1,2:1', load);
    const second = cachedRequest('orders:1,2:1', load);
    await Promise.resolve();
    assert.equal(calls, 1);
    finish({ ids: [1, 2] });
    assert.deepEqual(await Promise.all([first, second]), [
        { ids: [1, 2] },
        { ids: [1, 2] },
    ]);
});

test('reuses a completed result without another request', async () => {
    const { cachedRequest } = await freshCache();
    await cachedRequest('products:1:1', async () => ['phone']);

    assert.deepEqual(
        await cachedRequest('products:1:1', async () => {
            assert.fail('The cached request must not fetch again');
        }),
        ['phone'],
    );
});

test('refreshes the result after sixty seconds', async (context) => {
    const { cachedRequest } = await freshCache();
    let now = 1000;
    context.mock.method(Date, 'now', () => now);
    await cachedRequest('page', async () => 'old price');
    now += 60_000;

    assert.equal(
        await cachedRequest('page', async () => 'new price'),
        'new price',
    );
});

test('keeps different user, type, IDs, and page keys independent', async () => {
    const { cachedRequest } = await freshCache();
    const keys = [
        'user1:orders:1:1',
        'user2:orders:1:1',
        'user1:products:1:1',
        'user1:orders:2:1',
        'user1:orders:1:2',
    ];

    const results = await Promise.all(
        keys.map((key) => cachedRequest(key, async () => key)),
    );

    assert.deepEqual(results, keys);
});

test('allows retrying failed requests without caching their error', async () => {
    const { cachedRequest } = await freshCache();
    await assert.rejects(
        cachedRequest('page', async () => {
            throw new Error('Network failure');
        }),
        /Network failure/,
    );

    assert.equal(
        await cachedRequest('page', async () => 'recovered'),
        'recovered',
    );
});

test('evicts older entries when the cache reaches its limit', async () => {
    const { cachedRequest } = await freshCache();
    for (let index = 0; index <= 100; index++) {
        await cachedRequest(String(index), async () => 'cached');
    }

    assert.equal(
        await cachedRequest('0', async () => 'fetched again'),
        'fetched again',
    );
});

import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Input } from '@/components/form';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { shop } from '@/routes';
import { index as ordersIndex } from '@/routes/orders';

type Props = { kind: 'products' | 'orders' };

export default function ListingFilters({ kind }: Props) {
    const { url } = usePage();
    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const [loading, setLoading] = useState(false);
    const path = kind === 'products' ? shop.url() : ordersIndex.url();
    const emptyValues = {
        min_price: '',
        max_price: '',
        date_from: '',
        date_to: '',
        status: '',
    };
    const methods = useForm<Record<string, string>>({
        defaultValues: { ...emptyValues, ...Object.fromEntries(query) },
    });
    const { reset } = methods;
    useEffect(() => {
        reset({
            min_price: '',
            max_price: '',
            date_from: '',
            date_to: '',
            status: '',
            ...Object.fromEntries(new URLSearchParams(url.split('?')[1] ?? '')),
        });
    }, [url, reset]);
    function submit(values: Record<string, string>) {
        const data = Object.fromEntries(
            Object.entries(values).filter(
                ([key, value]) => value !== '' && key !== 'page',
            ),
        );
        router.get(path, data, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    }
    function clear() {
        router.get(
            path,
            kind === 'products' && query.get('category')
                ? { category: query.get('category')! }
                : {},
            { preserveScroll: true },
        );
    }
    const fields =
        kind === 'products'
            ? [
                  ['min_price', 'Minimum price (Toman)', 'number'],
                  ['max_price', 'Maximum price (Toman)', 'number'],
              ]
            : [
                  ['date_from', 'From date', 'date'],
                  ['date_to', 'To date', 'date'],
              ];
    const inputClass = 'h-9! rounded-lg! px-3! text-xs! [color-scheme:dark]';
    return (
        <Form
            methods={methods}
            onSubmit={submit}
            isPending={loading}
            className="flex flex-wrap items-end gap-2.5 [&>div]:w-full [&>div]:space-y-1.5 [&>div]:sm:w-44"
        >
            {fields.map(([name, label, type]) => (
                <Input
                    key={name}
                    name={name}
                    label={label}
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    step={type === 'number' ? 'any' : undefined}
                    disabled={loading}
                    className={inputClass}
                />
            ))}
            {kind === 'orders' && (
                <label className="flex w-full flex-col gap-1.5 text-xs text-secondary sm:w-44">
                    <span>Order status</span>
                    <select
                        {...methods.register('status')}
                        disabled={loading}
                        className="h-9 w-full rounded-lg border border-outline/30 bg-input px-3 text-xs text-foreground [color-scheme:dark] outline-none focus:border-outline/70"
                    >
                        <option value="">All statuses</option>
                        {Object.entries({
                            PENDING: 'Pending',
                            PROCESSING: 'Processing',
                            SHIPPED: 'Shipped',
                            DELIVERED: 'Delivered',
                            CANCELLED: 'Cancelled',
                        }).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>
            )}
            <Button
                type="submit"
                loading={loading}
                startIcon={<Search size={15} />}
                size="sm"
                className="h-9! shrink-0 border-0! px-3!"
            >
                Apply filters
            </Button>
            <Button
                variant="tab"
                disabled={loading}
                onClick={clear}
                startIcon={<RotateCcw size={14} />}
                size="sm"
                className="h-9! shrink-0 px-3!"
            >
                Clear
            </Button>
        </Form>
    );
}

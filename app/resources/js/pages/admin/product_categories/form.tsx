import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { Form, Input } from '@/components/form';
import { Button } from '@/components/ui';
import { index, store, update } from '@/routes/admin/product-categories';
import AdminLayout from '../layout';
import type { Category } from '../types';

export default function CategoryForm({
    category,
}: {
    category: Category | null;
}) {
    const { errors } = usePage().props;
    const methods = useForm<{ title: string; showroom_slot: string }>({
        defaultValues: {
            title: category?.title ?? '',
            showroom_slot: category?.showroom_slot ?? '',
        },
    });
    const [processing, setProcessing] = useState(false);
    function submit(values: { title: string; showroom_slot: string }) {
        const options = {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        };
        if (category) router.put(update.url(category.id), values, options);
        else router.post(store.url(), values, options);
    }
    const title = category ? 'Edit category' : 'New category';
    return (
        <>
            <Head title={title} />
            <header>
                <Link
                    href={index()}
                    className="text-sm text-muted hover:text-foreground"
                >
                    Categories
                </Link>
                <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
            </header>
            <section className="max-w-2xl rounded-2xl border border-border bg-surface/60 p-5 sm:p-7">
                <Form
                    methods={methods}
                    onSubmit={submit}
                    isPending={processing}
                    className="space-y-6 [&_label]:text-sm"
                >
                    <Input
                        name="title"
                        label="Category name"
                        maxLength={255}
                        autoFocus
                        autoComplete="off"
                        required
                        readOnly={processing}
                        dir="auto"
                    />
                    <div className="space-y-2.5">
                        <label
                            htmlFor="showroom-slot"
                            className="block text-sm font-medium text-ui-soft"
                        >
                            Showroom table
                        </label>
                        <select
                            id="showroom-slot"
                            {...methods.register('showroom_slot')}
                            disabled={processing}
                            aria-invalid={!!errors.showroom_slot}
                            className="h-12 w-full rounded-xl border border-border bg-input px-3 text-sm"
                        >
                            <option value="">
                                Not displayed on a middle table
                            </option>
                            <option value="phone">Phone table</option>
                            <option value="laptop">Laptop table</option>
                            <option value="gaming">Gaming table</option>
                            <option value="accessories">
                                Accessories table
                            </option>
                        </select>
                        {errors.showroom_slot && (
                            <p role="alert" className="text-sm text-danger">
                                {errors.showroom_slot}
                            </p>
                        )}
                        <p className="text-sm text-muted">
                            Products with GLB models will appear on this table.
                        </p>
                    </div>
                    {category && (
                        <p className="text-sm text-muted">
                            {category.product_count.toLocaleString()} products
                            in this category. This count is managed
                            automatically.
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="submit"
                            loading={processing}
                            startIcon={<Save size={17} />}
                        >
                            Save category
                        </Button>
                        <Link
                            href={index()}
                            className="px-3 py-3 text-sm text-secondary"
                        >
                            Cancel
                        </Link>
                    </div>
                </Form>
            </section>
        </>
    );
}
CategoryForm.layout = AdminLayout;

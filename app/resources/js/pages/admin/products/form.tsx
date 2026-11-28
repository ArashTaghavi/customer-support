import { Head, Link, router, usePage } from '@inertiajs/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Save, Cuboid, Image } from 'lucide-react';
import { Form, Input, Textarea, FileInput } from '@/components/form';
import { Button } from '@/components/ui';
import { index, store, update } from '@/routes/admin/products';
import { create as createCategory } from '@/routes/admin/product-categories';
import AdminLayout from '../layout';
import type { Product, Category, Collection } from '../types';
const ModelPreview = lazy(() => import('../components/model_preview'));
type Values = {
    title: string;
    description: string;
    price: string;
    stock: string;
    showroom_order: string;
    product_category_id: string;
    image: File | null;
    model_file: File | null;
    remove_image: boolean;
    remove_model_file: boolean;
};

export default function ProductForm({
    product,
    categories,
}: {
    product: Product | null;
    categories: Collection<Category>;
}) {
    const { errors } = usePage().props;
    const methods = useForm<Values>({
        defaultValues: {
            title: product?.title ?? '',
            description: product?.description ?? '',
            price: String(product?.price ?? ''),
            stock: String(product?.stock ?? 1),
            showroom_order: String(product?.showroom_order ?? ''),
            product_category_id: String(product?.product_category_id ?? ''),
            image: null,
            model_file: null,
            remove_image: false,
            remove_model_file: false,
        },
    });
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [image, model] = useWatch({
        control: methods.control,
        name: ['image', 'model_file'],
    });
    const { setValue } = methods;
    useEffect(() => {
        if (image) setValue('remove_image', false);
        if (model) setValue('remove_model_file', false);
    }, [image, model, setValue]);
    function submit(values: Values) {
        if (processing) return;
        router.post(
            product ? update.url(product.id) : store.url(),
            {
                title: values.title,
                description: values.description,
                price: values.price,
                stock: values.stock,
                showroom_order: values.showroom_order || null,
                product_category_id: values.product_category_id,
                remove_image: values.remove_image,
                remove_model_file: values.remove_model_file,
                ...(product ? { _method: 'put' } : {}),
                ...(values.image ? { image: values.image } : {}),
                ...(values.model_file ? { model_file: values.model_file } : {}),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setProgress(null);
                },
                onProgress: (event) => setProgress(event?.percentage ?? null),
                onFinish: () => {
                    setProcessing(false);
                    setProgress(null);
                },
            },
        );
    }
    const title = product ? 'Edit product' : 'New product';
    return (
        <>
            <Head title={title} />
            <header>
                <Link
                    href={index()}
                    className="text-sm text-muted hover:text-foreground"
                >
                    Products
                </Link>
                <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
                <p className="mt-2 text-sm text-muted">
                    Product details, inventory and media in one place.
                </p>
            </header>
            {!categories.data.length && (
                <p className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
                    Create a category before adding a product.{' '}
                    <Link href={createCategory()} className="underline">
                        Add category
                    </Link>
                </p>
            )}
            <Form
                methods={methods}
                onSubmit={submit}
                isPending={processing}
                className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] [&_label]:text-sm"
            >
                <div className="min-w-0 space-y-6 rounded-2xl border border-border bg-surface/60 p-5 sm:p-7">
                    <h2 className="text-base font-semibold">Product details</h2>
                    <Input
                        name="title"
                        label="Product name"
                        maxLength={255}
                        autoFocus
                        required
                        readOnly={processing}
                        dir="auto"
                    />
                    <div className="space-y-2.5">
                        <label
                            htmlFor="product-category"
                            className="block font-medium text-ui-soft"
                        >
                            Category
                        </label>
                        <select
                            id="product-category"
                            {...methods.register('product_category_id')}
                            required
                            disabled={processing}
                            aria-invalid={!!errors.product_category_id}
                            aria-describedby={
                                errors.product_category_id
                                    ? 'category-error'
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-border bg-input px-3 text-sm outline-none focus:border-primary"
                        >
                            <option value="">Choose a category</option>
                            {categories.data.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                        {errors.product_category_id && (
                            <p
                                id="category-error"
                                role="alert"
                                className="text-sm text-danger"
                            >
                                {errors.product_category_id}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            name="price"
                            label="Price"
                            type="number"
                            min={0}
                            max={4294967295}
                            step={1}
                            required
                            readOnly={processing}
                        />
                        <Input
                            name="stock"
                            label="Stock"
                            type="number"
                            min={0}
                            max={65535}
                            step={1}
                            required
                            readOnly={processing}
                        />
                    </div>
                    <Textarea
                        name="description"
                        label="Description"
                        rows={6}
                        maxLength={16000}
                        readOnly={processing}
                        dir="auto"
                    />
                    {progress !== null && (
                        <div role="status">
                            <p className="mb-2 text-sm text-muted">
                                Uploading {Math.round(progress)}%
                            </p>
                            <progress
                                className="h-2 w-full accent-violet-500"
                                max={100}
                                value={progress}
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
                        <Button
                            type="submit"
                            loading={processing}
                            disabled={!categories.data.length}
                            startIcon={<Save size={17} />}
                        >
                            Save product
                        </Button>
                        <Link
                            href={index()}
                            className="px-3 py-3 text-sm text-secondary"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
                <div className="min-w-0 space-y-6">
                    <section className="space-y-5 rounded-2xl border border-border bg-surface/60 p-5">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <Image size={18} />
                            Product image
                        </h2>
                        {product?.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.title}
                                className="h-44 w-full rounded-xl bg-input object-contain"
                            />
                        )}
                        <FileInput
                            name="image"
                            label={
                                product?.image_url
                                    ? 'Replace image'
                                    : 'Upload image'
                            }
                            accept="image/jpeg,image/png,image/webp"
                            disabled={processing}
                            hint="JPG, PNG or WebP. Up to 5 MB."
                        />
                        {image && (
                            <p className="text-sm break-all text-muted">
                                {image.name}
                            </p>
                        )}
                        {product?.image_url && (
                            <label className="flex items-center gap-2 text-sm text-muted">
                                <input
                                    type="checkbox"
                                    {...methods.register('remove_image')}
                                    disabled={processing || !!image}
                                    className="accent-violet-500"
                                />
                                Remove current image
                            </label>
                        )}
                    </section>
                    <section className="space-y-5 rounded-2xl border border-border bg-surface/60 p-5">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <Cuboid size={18} />
                            3D model
                        </h2>
                        {product?.model_url && (
                            <>
                                <Suspense
                                    fallback={
                                        <div className="grid h-72 place-items-center rounded-xl bg-input text-sm text-muted">
                                            Loading model…
                                        </div>
                                    }
                                >
                                    <ModelPreview url={product.model_url} />
                                </Suspense>
                                <a
                                    href={product.model_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block text-sm text-highlight underline"
                                >
                                    Open saved GLB
                                </a>
                            </>
                        )}
                        <Input
                            name="showroom_order"
                            label="Table display order"
                            type="number"
                            min={1}
                            max={2147483647}
                            step={1}
                            readOnly={processing}
                            placeholder="Automatic"
                            aria-describedby="showroom-order-help"
                        />
                        <p
                            id="showroom-order-help"
                            className="text-xs leading-5 text-muted"
                        >
                            Lower numbers appear first on this category's table,
                            from left to right and across pages. Leave empty to
                            show after manually ordered models.
                        </p>
                        <FileInput
                            name="model_file"
                            label={
                                product?.model_url
                                    ? 'Replace GLB model'
                                    : 'Upload GLB model'
                            }
                            accept=".glb,model/gltf-binary"
                            disabled={processing}
                            hint="Self-contained GLB 2.0, with embedded textures. Up to 50 MB."
                        />
                        {model && (
                            <p className="text-sm break-all text-muted">
                                {model.name} ·{' '}
                                {(model.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                        )}
                        {product?.model_url && (
                            <label className="flex items-center gap-2 text-sm text-muted">
                                <input
                                    type="checkbox"
                                    {...methods.register('remove_model_file')}
                                    disabled={processing || !!model}
                                    className="accent-violet-500"
                                />
                                Remove current model
                            </label>
                        )}
                        <p className="text-sm leading-relaxed text-muted">
                            The saved model is attached to this product and
                            ready to use in the showroom.
                        </p>
                    </section>
                </div>
            </Form>
        </>
    );
}
ProductForm.layout = AdminLayout;

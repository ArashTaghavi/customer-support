import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    Cuboid,
    FolderTree,
    Plus,
    ShoppingBag,
} from 'lucide-react';
import { index as products, create, edit } from '@/routes/admin/products';
import { index as categories } from '@/routes/admin/product-categories';
import { shop } from '@/routes';
import AdminLayout from './layout';
import type { Collection, Product } from './types';

type Props = {
    stats: { products: number; categories: number; models: number };
    recentProducts: Collection<Product>;
};

export default function AdminDashboard({ stats, recentProducts }: Props) {
    const cards = [
        {
            label: 'Products',
            count: stats.products,
            icon: Boxes,
            href: products(),
        },
        {
            label: 'Categories',
            count: stats.categories,
            icon: FolderTree,
            href: categories(),
        },
        {
            label: '3D product models',
            count: stats.models,
            icon: Cuboid,
            href: products(),
        },
    ];
    return (
        <>
            <Head title="Admin panel" />
            <header className="flex flex-wrap items-center justify-between gap-5">
                <div>
                    <p className="mb-2 text-xs font-medium tracking-[0.16em] text-highlight">
                        NOVA ADMIN
                    </p>
                    <h1 className="text-3xl font-semibold">
                        Manage your showroom
                    </h1>
                    <p className="mt-3 text-sm text-muted">
                        Keep your products, categories and 3D displays up to
                        date.
                    </p>
                </div>
                <Link
                    href={shop()}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-secondary hover:border-outline/40 hover:text-foreground"
                >
                    <ShoppingBag size={17} />
                    Open showroom
                </Link>
            </header>
            <section
                aria-label="Catalog overview"
                className="grid gap-4 sm:grid-cols-3"
            >
                {cards.map(({ label, count, icon: Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="glass-card rounded-2xl p-5 transition-colors hover:border-outline/40"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-secondary">
                                {label}
                            </span>
                            <span className="rounded-xl bg-primary/15 p-2.5 text-highlight">
                                <Icon size={20} />
                            </span>
                        </div>
                        <p className="mt-5 text-3xl font-semibold tabular-nums">
                            {count.toLocaleString('en-US')}
                        </p>
                    </Link>
                ))}
            </section>
            <section
                className="glass-card rounded-2xl p-5 sm:p-7"
                aria-labelledby="admin-catalog-title"
            >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2
                            id="admin-catalog-title"
                            className="text-xl font-semibold"
                        >
                            Catalog
                        </h2>
                        <p className="mt-2 text-sm text-muted">
                            Manage product details, inventory, media and table
                            display order.
                        </p>
                    </div>
                    <Link
                        href={create()}
                        className="button-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                    >
                        <Plus size={17} />
                        Add product
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Link
                        href={products()}
                        className="flex items-center gap-4 rounded-xl border border-border bg-highlight/3 p-5 hover:border-outline/40"
                    >
                        <Boxes size={25} className="text-highlight" />
                        <span className="flex-1">
                            <span className="block font-medium">Products</span>
                            <span className="mt-1 block text-xs text-muted">
                                Images, 3D models, stock and prices
                            </span>
                        </span>
                        <ArrowRight size={18} className="text-muted" />
                    </Link>
                    <Link
                        href={categories()}
                        className="flex items-center gap-4 rounded-xl border border-border bg-highlight/3 p-5 hover:border-outline/40"
                    >
                        <FolderTree size={25} className="text-highlight" />
                        <span className="flex-1">
                            <span className="block font-medium">
                                Categories
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                                Organize products and assign showroom tables
                            </span>
                        </span>
                        <ArrowRight size={18} className="text-muted" />
                    </Link>
                </div>
            </section>
            <section
                className="glass-card rounded-2xl p-5 sm:p-7"
                aria-labelledby="admin-recent-title"
            >
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2
                        id="admin-recent-title"
                        className="text-lg font-semibold"
                    >
                        Recently added
                    </h2>
                    <Link
                        href={products()}
                        className="text-sm text-highlight hover:text-foreground"
                    >
                        View catalog
                    </Link>
                </div>
                {recentProducts.data.length ? (
                    <ul className="divide-y divide-border/40">
                        {recentProducts.data.map((product) => (
                            <li key={product.id}>
                                <Link
                                    href={edit(product.id)}
                                    className="flex items-center gap-4 rounded-lg py-4 hover:bg-highlight/3"
                                >
                                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-highlight/5">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt=""
                                                className="size-full object-contain"
                                            />
                                        ) : (
                                            <Cuboid
                                                size={22}
                                                className="text-highlight"
                                            />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className="block truncate text-sm font-medium"
                                            dir="auto"
                                        >
                                            {product.title}
                                        </span>
                                        <span className="mt-1 block text-xs text-muted">
                                            {product.product_category?.title ??
                                                'Uncategorized'}
                                        </span>
                                    </span>
                                    <ArrowRight
                                        size={16}
                                        className="text-muted"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="py-8 text-center text-sm text-muted">
                        Your catalog is empty. Add your first product to get
                        started.
                    </p>
                )}
            </section>
        </>
    );
}
AdminDashboard.layout = AdminLayout;

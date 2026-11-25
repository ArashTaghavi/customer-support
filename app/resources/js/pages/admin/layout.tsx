import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Boxes,
    FolderTree,
    LayoutDashboard,
    ShoppingBag,
    UserRound,
} from 'lucide-react';
import { index as products } from '@/routes/admin/products';
import { index as categories } from '@/routes/admin/product-categories';
import { index as panel } from '@/routes/app';
import { shop } from '@/routes';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const page = usePage<{ notice?: string | null }>();
    const items = [
        {
            label: 'Products',
            href: products(),
            component: 'admin/products/',
            icon: Boxes,
        },
        {
            label: 'Categories',
            href: categories(),
            component: 'admin/product_categories/',
            icon: FolderTree,
        },
    ];
    return (
        <div dir="ltr" className="min-h-dvh bg-canvas text-foreground">
            <aside className="border-b border-border bg-sidebar lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
                <div className="flex items-center gap-3 px-5 py-6">
                    <span className="rounded-xl bg-primary/15 p-2.5 text-highlight">
                        <LayoutDashboard size={22} />
                    </span>
                    <div>
                        <p className="text-lg font-semibold">Catalog</p>
                        <p className="text-sm text-muted">
                            Management workspace
                        </p>
                    </div>
                </div>
                <nav
                    aria-label="Catalog navigation"
                    className="flex gap-2 px-4 pb-4 lg:flex-col"
                >
                    {items.map(({ label, href, component, icon: Icon }) => (
                        <Link
                            key={component}
                            href={href}
                            aria-current={
                                page.component.startsWith(component)
                                    ? 'page'
                                    : undefined
                            }
                            className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${page.component.startsWith(component) ? 'bg-primary/15 text-highlight' : 'text-secondary hover:bg-highlight/5'}`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="flex gap-3 border-t border-border px-5 py-4 text-sm text-muted lg:mt-auto lg:flex-col">
                    <Link
                        href={panel()}
                        className="flex items-center gap-2 hover:text-foreground"
                    >
                        <UserRound size={17} />
                        User panel
                    </Link>
                    <Link
                        href={shop()}
                        className="flex items-center gap-2 hover:text-foreground"
                    >
                        <ShoppingBag size={17} />
                        Showroom
                    </Link>
                </div>
            </aside>
            <main className="min-w-0 px-4 py-7 sm:px-8 lg:ml-64 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-6">
                    {page.props.notice && (
                        <p
                            role="status"
                            className="rounded-xl border border-success/25 bg-success/10 p-4 text-sm text-success"
                        >
                            {page.props.notice}
                        </p>
                    )}
                    {page.props.errors.delete && (
                        <p
                            role="alert"
                            className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger"
                        >
                            {page.props.errors.delete}
                        </p>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}

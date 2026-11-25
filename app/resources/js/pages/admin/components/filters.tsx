import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Category, Filters } from '../types';

export default function CatalogFilters({
    filters,
    categories,
    onChange,
}: {
    filters: Filters;
    categories?: Category[];
    onChange: (values: Filters) => void;
}) {
    const [search, setSearch] = useState(filters.q ?? '');
    useEffect(() => setSearch(filters.q ?? ''), [filters.q]);
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onChange({ q: search, page: 1 });
            }}
            className="flex flex-wrap gap-3 p-4"
        >
            <label className="relative min-w-40 flex-1">
                <span className="sr-only">Search by title</span>
                <Search
                    size={17}
                    className="pointer-events-none absolute top-3.5 left-3 text-muted"
                />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    type="search"
                    maxLength={255}
                    placeholder="Search by title…"
                    className="h-11 w-full rounded-xl border border-border bg-input pr-3 pl-10 text-sm outline-none focus:border-primary"
                />
            </label>
            {categories && (
                <label>
                    <span className="sr-only">Filter by category</span>
                    <select
                        aria-label="Filter by category"
                        value={filters.category ?? ''}
                        onChange={(event) =>
                            onChange({
                                category: event.target.value,
                                q: search,
                                page: 1,
                            })
                        }
                        className="h-11 max-w-64 rounded-xl border border-border bg-input px-3 text-sm"
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.title}
                            </option>
                        ))}
                    </select>
                </label>
            )}
            <Button type="submit" variant="secondary" className="h-11!">
                Search
            </Button>
            {(filters.q || filters.category) && (
                <Button
                    variant="tab"
                    size="icon"
                    aria-label="Clear filters"
                    onClick={() => {
                        setSearch('');
                        onChange({ q: '', category: '', page: 1 });
                    }}
                >
                    <X size={17} />
                </Button>
            )}
        </form>
    );
}

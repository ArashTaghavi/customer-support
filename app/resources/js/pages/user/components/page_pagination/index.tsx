import { Fragment } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Paginated } from '@/types/pagination';

type Props = {
    meta: Paginated<unknown>['meta'];
    onPage: (page: number) => void;
};

export default function PagePagination({ meta, onPage }: Props) {
    if (meta.last_page <= 1) return null;
    const current = meta.current_page;
    const last = meta.last_page;
    const pages =
        last <= 7
            ? Array.from({ length: last }, (_, index) => index + 1)
            : [
                  ...new Set([
                      1,
                      last,
                      ...Array.from(
                          { length: 3 },
                          (_, index) => current - 1 + index,
                      ),
                      ...(current <= 3 ? [2, 3, 4] : []),
                      ...(current >= last - 2
                          ? [last - 3, last - 2, last - 1]
                          : []),
                  ]),
              ]
                  .filter((page) => page >= 1 && page <= last)
                  .sort((a, b) => a - b);
    const controlClass =
        'size-7! rounded-lg! text-foreground! sm:size-9! sm:rounded-xl! hover:bg-glow/15! disabled:opacity-25!';
    return (
        <footer className="flex shrink-0 flex-col items-center justify-center gap-3 border-t border-outline/10 bg-sidebar/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:flex-row sm:justify-between">
            <p className="text-[11px] text-muted sm:text-xs" aria-live="polite">
                Page{' '}
                <span className="font-medium text-foreground">
                    {current.toLocaleString('en-US')}
                </span>{' '}
                of {last.toLocaleString('en-US')}
                <span aria-hidden="true" className="mx-2 text-foreground/30">
                    ·
                </span>
                {meta.total.toLocaleString('en-US')} results
            </p>
            <nav
                aria-label="Pagination"
                className="flex items-center gap-1"
                dir="ltr"
            >
                <Button
                    variant="tab"
                    size="icon"
                    className={controlClass}
                    aria-label="Previous page"
                    tooltip="Previous page"
                    disabled={current <= 1}
                    onClick={() => onPage(current - 1)}
                    startIcon={<ChevronLeft size={16} aria-hidden="true" />}
                />
                {pages.map((page, index) => (
                    <Fragment key={page}>
                        {index > 0 && page - pages[index - 1] > 1 && (
                            <span
                                aria-hidden="true"
                                className="flex w-4 items-center justify-center text-xs text-muted"
                            >
                                …
                            </span>
                        )}
                        <Button
                            variant="tab"
                            size="icon"
                            aria-label={`Page ${page.toLocaleString('en-US')}`}
                            aria-current={page === current ? 'page' : undefined}
                            onClick={() => {
                                if (page !== current) onPage(page);
                            }}
                            className={`size-7! rounded-lg! text-xs! tabular-nums transition-all sm:size-9! sm:rounded-xl! ${page === current ? 'bg-primary/25! font-semibold! text-foreground! shadow-glass' : 'text-secondary! hover:bg-glow/10! hover:text-foreground!'}`}
                        >
                            {page.toLocaleString('en-US')}
                        </Button>
                    </Fragment>
                ))}
                <Button
                    variant="tab"
                    size="icon"
                    className={controlClass}
                    aria-label="Next page"
                    tooltip="Next page"
                    disabled={current >= last}
                    onClick={() => onPage(current + 1)}
                    startIcon={<ChevronRight size={16} aria-hidden="true" />}
                />
            </nav>
        </footer>
    );
}

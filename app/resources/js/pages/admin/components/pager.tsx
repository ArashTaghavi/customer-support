import { Button } from '@/components/ui';
import type { Paginated } from '@/types/pagination';

export default function Pager({
    meta,
    onPage,
}: {
    meta: Paginated<unknown>['meta'];
    onPage: (page: number) => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 text-sm text-muted">
            <p>
                {meta.total.toLocaleString()} records · Page {meta.current_page}{' '}
                of {meta.last_page}
            </p>
            <nav aria-label="Pagination" className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPage(meta.current_page - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPage(meta.current_page + 1)}
                >
                    Next
                </Button>
            </nav>
        </div>
    );
}

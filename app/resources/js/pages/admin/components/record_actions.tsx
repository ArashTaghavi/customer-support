import { router } from '@inertiajs/react';
import { ActionButton, EditAction, DeleteAction } from '@/components/ui';

export default function RecordActions({
    title,
    editUrl,
    deleteUrl,
}: {
    title: string;
    editUrl: string;
    deleteUrl: string;
}) {
    return (
        <ActionButton>
            <EditAction
                label={`Edit ${title}`}
                onClick={() => router.visit(editUrl)}
            />
            <DeleteAction
                label={`Delete ${title}`}
                message={`Delete “${title}”?`}
                onConfirm={() =>
                    new Promise<void>((resolve) =>
                        router.delete(deleteUrl, {
                            preserveScroll: true,
                            onFinish: () => resolve(),
                        }),
                    )
                }
            />
        </ActionButton>
    );
}

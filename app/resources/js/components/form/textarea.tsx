import { useId, type TextareaHTMLAttributes } from 'react';
import { usePage } from '@inertiajs/react';
import {
    useController,
    useFormContext,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';

type TextareaProps<T extends FieldValues> = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'name' | 'defaultValue'
> & {
    name: FieldPath<T>;
    label: string;
};

export default function Textarea<T extends FieldValues>({
    name,
    label,
    id,
    className = '',
    ...props
}: TextareaProps<T>) {
    const { control } = useFormContext<T>();
    const { errors } = usePage().props;

    const {
        field,
        fieldState: { error: validationError },
    } = useController({ name, control });

    const error = validationError?.message ?? errors[name];

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="space-y-2.5">
            <label
                htmlFor={inputId}
                className="block text-xs font-medium text-ui-soft"
            >
                {label}
                {error && (
                    <span
                        id={errorId}
                        role="alert"
                        className="mx-2 text-xs text-danger"
                    >
                        {error}
                    </span>
                )}
            </label>

            <textarea
                {...props}
                autoComplete="off"
                {...field}
                id={inputId}
                value={field.value ?? ''}
                aria-invalid={!!error}
                aria-describedby={
                    [error && errorId, props['aria-describedby']]
                        .filter(Boolean)
                        .join(' ') || undefined
                }
                className={[
                    'min-h-12 w-full resize-y rounded-xl border bg-input px-4 py-3 text-sm text-foreground transition outline-none placeholder:text-ui-subtle disabled:opacity-50',
                    error
                        ? 'border-danger/60 focus:border-danger focus:ring-4 focus:ring-danger/10'
                        : 'border-outline/30 hover:border-outline/50 focus:border-outline/70 focus:ring-4 focus:ring-outline/10',
                    className,
                ].join(' ')}
            />
        </div>
    );
}

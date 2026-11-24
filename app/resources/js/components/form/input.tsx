import { useId, type InputHTMLAttributes } from 'react';
import { usePage } from '@inertiajs/react';
import {
    useController,
    useFormContext,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';

type InputProps<T extends FieldValues> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'defaultValue'
> & {
    name: FieldPath<T>;
    label: string;
};

export default function Input<T extends FieldValues>({
    name,
    label,
    id,
    className = '',
    ...props
}: InputProps<T>) {
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

            <input
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
                    'h-12 w-full rounded-xl border bg-input px-4 text-sm text-foreground transition outline-none placeholder:text-ui-subtle disabled:opacity-50',
                    error
                        ? 'border-danger/60 focus:border-danger focus:ring-4 focus:ring-danger/10'
                        : 'border-outline/30 hover:border-outline/50 focus:border-outline/70 focus:ring-4 focus:ring-outline/10',
                    className,
                ].join(' ')}
            />
        </div>
    );
}

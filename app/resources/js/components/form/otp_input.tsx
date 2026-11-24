import { useId, useRef, type InputHTMLAttributes } from 'react';
import { usePage } from '@inertiajs/react';
import {
    useController,
    useFormContext,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';
import { normalizeDigits } from '@/lib/digits';

type OtpInputProps<T extends FieldValues> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'maxLength'
    | 'size'
> & {
    name: FieldPath<T>;
    label: string;
    length?: number;
    onComplete?: (code: string) => void;
};

export default function OtpInput<T extends FieldValues>({
    name,
    label,
    length = 6,
    onComplete,
    autoFocus = false,
    disabled = false,
    readOnly = false,
    className = '',
    id,
    onKeyDown,
    onPaste,
    onFocus,
    onBlur,
    ...props
}: OtpInputProps<T>) {
    const { control } = useFormContext<T>();
    const { errors } = usePage().props;
    const { field, fieldState } = useController({ name, control });
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const count = Math.max(1, Math.floor(length) || 6);
    const value = String(field.value ?? '').slice(0, count);
    const error = fieldState.error?.message ?? errors[name];
    const description =
        [error && `${inputId}-error`, props['aria-describedby']]
            .filter(Boolean)
            .join(' ') || undefined;

    function focus(index: number) {
        inputs.current[Math.max(0, Math.min(index, count - 1))]?.focus();
    }

    function update(next: string) {
        field.onChange(next);
        if (next.length === count && next !== value) {
            onComplete?.(next);
        }
    }

    function insert(text: string, index: number) {
        if (disabled || readOnly) return;
        const digits = normalizeDigits(text).replace(/\D/g, '');
        if (!digits) return;
        const start =
            digits.length >= count ? 0 : Math.min(index, value.length);
        const next = (
            value.slice(0, start) +
            digits +
            value.slice(start + digits.length)
        ).slice(0, count);
        update(next);
        focus(Math.min(start + digits.length, next.length));
    }

    return (
        <div className="space-y-2.5">
            <label
                htmlFor={`${inputId}-0`}
                id={`${inputId}-label`}
                className="block text-xs font-medium text-ui-soft"
            >
                {label}
            </label>
            <div
                role="group"
                aria-labelledby={`${inputId}-label`}
                aria-describedby={description}
                className="flex gap-2"
                dir="ltr"
            >
                {Array.from({ length: count }, (_, index) => (
                    <input
                        {...props}
                        key={index}
                        id={`${inputId}-${index}`}
                        ref={(element) => {
                            inputs.current[index] = element;
                            if (index === 0) field.ref(element);
                        }}
                        name={`${name}-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        autoFocus={autoFocus && index === 0}
                        disabled={disabled}
                        readOnly={readOnly}
                        value={value[index] ?? ''}
                        aria-label={`${label}، رقم ${index + 1} از ${count}`}
                        aria-invalid={!!error}
                        aria-describedby={description}
                        onChange={(event) => {
                            const text = event.target.value;
                            if (text === '') {
                                update(
                                    value.slice(0, index) +
                                        value.slice(index + 1),
                                );
                            } else {
                                insert(text, index);
                            }
                        }}
                        onFocus={(event) => {
                            event.currentTarget.select();
                            onFocus?.(event);
                        }}
                        onBlur={(event) => {
                            field.onBlur();
                            onBlur?.(event);
                        }}
                        onPaste={(event) => {
                            onPaste?.(event);
                            if (event.defaultPrevented || disabled || readOnly)
                                return;
                            event.preventDefault();
                            insert(event.clipboardData.getData('text'), index);
                        }}
                        onKeyDown={(event) => {
                            onKeyDown?.(event);
                            if (event.defaultPrevented) return;
                            if (
                                event.key === 'ArrowLeft' ||
                                event.key === 'ArrowRight'
                            ) {
                                event.preventDefault();
                                focus(
                                    index +
                                        (event.key === 'ArrowLeft' ? -1 : 1),
                                );
                            } else if (
                                event.key === 'Home' ||
                                event.key === 'End'
                            ) {
                                event.preventDefault();
                                focus(event.key === 'Home' ? 0 : value.length);
                            } else if (
                                !disabled &&
                                !readOnly &&
                                (event.key === 'Backspace' ||
                                    event.key === 'Delete')
                            ) {
                                event.preventDefault();
                                const target =
                                    event.key === 'Backspace' && !value[index]
                                        ? index - 1
                                        : index;
                                if (target >= 0) {
                                    update(
                                        value.slice(0, target) +
                                            value.slice(target + 1),
                                    );
                                    focus(
                                        event.key === 'Backspace'
                                            ? Math.max(0, index - 1)
                                            : index,
                                    );
                                }
                            }
                        }}
                        className={[
                            'h-12 min-w-0 flex-1 rounded-xl border bg-input text-center text-xl text-foreground transition outline-none disabled:opacity-50',
                            error
                                ? 'border-danger/60 focus:border-danger focus:ring-4 focus:ring-danger/10'
                                : 'border-ui-border focus:border-outline/60 focus:ring-4 focus:ring-outline/10',
                            className,
                        ].join(' ')}
                    />
                ))}
            </div>
            {error && (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="text-xs text-danger"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import Tooltip from '../feedback/tooltip';

type ButtonVariant =
    'primary' | 'secondary' | 'danger' | 'outline-danger' | 'tab';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tooltip?: string;
    variant?: ButtonVariant;
    size?: 'default' | 'icon' | 'sm';
    loading?: boolean;
    fullWidth?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
    tab: 'border-transparent bg-transparent text-ui-secondary hover:bg-highlight/5 hover:text-foreground aria-selected:bg-glow/10 aria-selected:text-highlight aria-selected:ring-1 aria-selected:ring-outline/20',
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'border-danger/30 bg-danger/15 text-danger hover:bg-danger/25',
    'outline-danger':
        'border-ui-border-muted bg-transparent text-ui-secondary hover:border-danger/20 hover:bg-danger/5 hover:text-danger',
};

const sizes = {
    default: 'h-12 gap-2.5 rounded-xl px-5 text-sm font-medium',
    icon: 'size-9 shrink-0 gap-2.5 rounded-xl p-0 text-sm font-medium',
    sm: 'gap-2 rounded-lg px-3 py-2 text-xs font-normal',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            tooltip,
            title,
            type = 'button',
            variant = 'primary',
            size = 'default',
            loading = false,
            disabled = false,
            fullWidth = false,
            startIcon,
            endIcon,
            className = '',
            ...props
        },
        ref,
    ) => {
        const button = (
            <button
                {...props}
                ref={ref}
                type={type}
                disabled={disabled || loading}
                aria-busy={loading}
                className={[
                    'inline-flex items-center justify-center border transition',
                    sizes[size],
                    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glow',
                    'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
                    variants[variant],
                    fullWidth && 'w-full',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {loading ? (
                    <LoaderCircle
                        size={18}
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                    />
                ) : (
                    startIcon
                )}

                {children}

                {!loading && endIcon}
            </button>
        );

        return tooltip || title ? (
            <Tooltip content={tooltip ?? title}>{button}</Tooltip>
        ) : (
            button
        );
    },
);

Button.displayName = 'Button';

export default Button;

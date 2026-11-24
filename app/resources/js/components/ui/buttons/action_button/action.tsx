'use client';

import { useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { ActionContext } from './context';
import Tooltip from '../../feedback/tooltip';

export interface ActionProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children'
> {
    icon: ReactNode;
    label: string;
    tooltip?: string;
    loading?: boolean;
    tone?: 'neutral' | 'edit' | 'delete' | 'view';
}

const tones = {
    neutral: 'text-ui-soft hover:text-foreground',
    edit: 'text-warning hover:text-warning',
    delete: 'text-danger hover:text-danger',
    view: 'text-info hover:text-info',
};

export default function Action({
    icon,
    label,
    tooltip,
    loading = false,
    disabled,
    tone = 'neutral',
    className = '',
    onClick,
    type = 'button',
    ...props
}: ActionProps) {
    const { menu, close } = useContext(ActionContext);
    return (
        <Tooltip content={tooltip ?? label}>
            <button
                {...props}
                type={type}
                role={menu ? 'menuitem' : props.role}
                disabled={disabled || loading}
                aria-busy={loading}
                aria-label={props['aria-label'] ?? label}
                className={`glass-icon inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg p-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
                onClick={(event) => {
                    onClick?.(event);
                    if (!event.defaultPrevented) close();
                }}
            >
                <span
                    className="pointer-events-none flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5"
                    aria-hidden="true"
                >
                    {loading ? (
                        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
                    ) : (
                        icon
                    )}
                </span>
            </button>
        </Tooltip>
    );
}

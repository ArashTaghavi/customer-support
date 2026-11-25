import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import LoginForm from '../../auth/components/login_form';

export default function LoginModal({
    onClose,
    onAuthenticated,
}: {
    onClose: () => void;
    onAuthenticated: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const element = dialog.current;
        if (!element) return;
        element.showModal();
        element
            .querySelector<HTMLInputElement>('input:not([type="hidden"])')
            ?.focus();
        return () => element.close();
    }, []);

    return (
        <dialog
            ref={dialog}
            className="showroom-login"
            aria-labelledby="showroom-login-title"
            onCancel={onClose}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="showroom-login-card" dir="rtl">
                <button
                    type="button"
                    className="showroom-login-close"
                    onClick={onClose}
                    aria-label="Close sign in"
                >
                    <X size={20} aria-hidden="true" />
                </button>
                <h2 id="showroom-login-title">USER PANEL</h2>
                <LoginForm returnTo="shop" onAuthenticated={onAuthenticated} />
            </div>
        </dialog>
    );
}

import { useEffect, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui';
import { index } from '@/routes/app';

type JsonCredential = PublicKeyCredential & { toJSON(): unknown };
type CredentialParser = typeof PublicKeyCredential & {
    parseCreationOptionsFromJSON(
        options: unknown,
    ): PublicKeyCredentialCreationOptions;
    parseRequestOptionsFromJSON(
        options: unknown,
    ): PublicKeyCredentialRequestOptions;
};

async function request(url: string, body?: unknown) {
    const token =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? '';
    const xsrf = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.slice('XSRF-TOKEN='.length);
    const response = await fetch(url, {
        method: body ? 'POST' : 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(xsrf
                ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) }
                : { 'X-CSRF-TOKEN': token }),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(
            response.status === 403
                ? 'Sign in again with a one-time code to register a passkey.'
                : response.status === 429
                  ? 'Too many attempts. Please wait and try again.'
                  : 'Something went wrong. Please try again.',
        );
    }
    return data;
}

export default function PasskeyButton({
    register = false,
    onAuthenticated,
}: {
    register?: boolean;
    onAuthenticated?: () => Promise<void> | void;
}) {
    const [supported, setSupported] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        setSupported(
            window.isSecureContext &&
                typeof PublicKeyCredential !== 'undefined' &&
                'parseCreationOptionsFromJSON' in PublicKeyCredential &&
                'parseRequestOptionsFromJSON' in PublicKeyCredential,
        );
    }, []);

    async function run() {
        setBusy(true);
        setMessage('');
        try {
            const parser = PublicKeyCredential as CredentialParser;
            const { options } = await request(
                register ? '/user/passkeys/options' : '/passkeys/login/options',
            );
            const credential = (await (register
                ? navigator.credentials.create({
                      publicKey: parser.parseCreationOptionsFromJSON(options),
                  })
                : navigator.credentials.get({
                      publicKey: parser.parseRequestOptionsFromJSON(options),
                  }))) as JsonCredential | null;
            if (!credential) return;
            await request(register ? '/user/passkeys' : '/passkeys/login', {
                credential: credential.toJSON(),
                ...(register ? { name: 'Passkey' } : {}),
            });
            if (register) setMessage('Passkey registered.');
            else if (onAuthenticated) {
                router.reload({
                    only: ['auth'],
                    onSuccess: () => onAuthenticated(),
                });
            } else router.visit(index.url());
        } catch (error) {
            setMessage(
                error instanceof DOMException &&
                    error.name === 'NotAllowedError'
                    ? 'The request was cancelled or timed out.'
                    : error instanceof Error
                      ? error.message
                      : 'The request could not be completed.',
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            {register && (
                <p className="text-xs leading-6 text-secondary">
                    Register a passkey to sign in with your fingerprint, face or
                    device PIN. A recent sign-in with a one-time code is
                    required.
                </p>
            )}
            <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                disabled={!supported || busy}
                loading={busy}
                onClick={run}
                startIcon={<Fingerprint size={17} />}
            >
                {register ? 'Register a passkey' : 'Sign in with a passkey'}
            </Button>
            {!supported && (
                <p role="status" className="text-xs leading-6 text-secondary">
                    Use HTTPS or localhost in an up-to-date browser to enable
                    passkeys. You can also sign in with a one-time code.
                </p>
            )}
            {message && (
                <p role="status" className="text-xs leading-6 text-secondary">
                    {message}
                </p>
            )}
        </div>
    );
}

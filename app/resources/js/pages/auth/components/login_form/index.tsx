import PasskeyButton from '@/components/passkey_button';
import { router, usePage } from '@inertiajs/react';
import {
    useForm,
    type SubmitHandler,
    type ResolverResult,
} from 'react-hook-form';
import { useEffect, useState } from 'react';
import { ArrowRight, RotateCw, Smartphone } from 'lucide-react';
import { Form, Input, OtpInput } from '@/components/form';
import Button from '@/components/ui/buttons/button';
import { normalizeDigits } from '@/lib/digits';
import { store as login } from '@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController';
import {
    store as sendOtp,
    destroy as changeMobile,
} from '@/actions/App/Http/Controllers/OtpAuthenticationController';

type AuthValues = { mobile_number: string; code: string };
type Challenge = {
    mobile_number: string;
    length: number;
    expires_at: number;
    resend_at: number;
};

export default function LoginForm({
    onAuthenticated,
}: {
    onAuthenticated?: () => Promise<void> | void;
}) {
    const { otp, resendAt, errors } = usePage<{
        otp: Challenge | null;
        resendAt: number;
    }>().props;
    const [processing, setProcessing] = useState(false);
    const [clock, setClock] = useState(() => Date.now());
    const methods = useForm<AuthValues>({
        defaultValues: { mobile_number: otp?.mobile_number ?? '', code: '' },
        resolver: (values): ResolverResult<AuthValues> => {
            const mobile = normalizeDigits(values.mobile_number.trim());
            if (!/^09[0-9]{9}$/.test(mobile)) {
                return {
                    values: {},
                    errors: {
                        mobile_number: {
                            type: 'pattern',
                            message:
                                'شماره موبایل معتبر وارد کنید؛ مانند 09123456789.',
                        },
                    },
                };
            }
            if (
                otp &&
                !new RegExp(`^[0-9]{${otp.length}}$`).test(values.code)
            ) {
                return {
                    values: {},
                    errors: {
                        code: {
                            type: 'pattern',
                            message: `کد ${otp.length} رقمی را وارد کنید.`,
                        },
                    },
                };
            }
            return { values: { ...values, mobile_number: mobile }, errors: {} };
        },
    });

    useEffect(() => {
        const timer = setInterval(() => setClock(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const mobile = otp?.mobile_number;
    const expiresAt = otp?.expires_at;
    const { reset, setFocus } = methods;
    useEffect(() => {
        if (mobile) {
            reset({ mobile_number: mobile, code: '' });
            setFocus('code');
        } else {
            reset({ mobile_number: '', code: '' });
            setFocus('mobile_number');
        }
    }, [mobile, expiresAt, reset, setFocus]);

    useEffect(() => {
        if (!processing && mobile) {
            setFocus('code');
        }
    }, [processing, mobile, setFocus]);

    const retryIn = Math.max(0, Math.ceil((resendAt * 1000 - clock) / 1000));
    const expiresIn = Math.max(
        0,
        Math.ceil(((expiresAt ?? 0) * 1000 - clock) / 1000),
    );
    const expired = !!otp && expiresIn === 0;

    const submit: SubmitHandler<AuthValues> = (data) => {
        if (processing || expired || (!otp && retryIn > 0)) return;
        router.post(
            otp ? login().url : sendOtp().url,
            otp ? data : { mobile_number: data.mobile_number },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => (otp ? onAuthenticated?.() : undefined),
                onError: () => {
                    if (otp) {
                        methods.setValue('code', '');
                        methods.setFocus('code');
                    }
                },
            },
        );
    };

    function resend() {
        if (!otp || processing || retryIn > 0) return;
        router.post(
            sendOtp().url,
            { mobile_number: otp.mobile_number },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    methods.reset({
                        mobile_number: otp.mobile_number,
                        code: '',
                    });
                    methods.setFocus('code');
                },
            },
        );
    }

    return (
        <Form
            methods={methods}
            onSubmit={submit}
            isPending={processing}
            className="mt-8 space-y-6"
        >
            {otp ? (
                <>
                    <div className="space-y-2 text-center">
                        <p className="text-sm leading-relaxed text-secondary">
                            کد تأیید شمارهٔ{' '}
                            <span
                                className="font-medium text-foreground"
                                dir="ltr"
                            >
                                {otp.mobile_number}
                            </span>{' '}
                            را وارد کنید.
                        </p>
                        <Button
                            type="button"
                            variant="tab"
                            size="sm"
                            disabled={processing}
                            onClick={() => {
                                router.delete(changeMobile().url, {
                                    onStart: () => setProcessing(true),
                                    onFinish: () => setProcessing(false),
                                });
                            }}
                        >
                            تغییر شماره موبایل
                        </Button>
                    </div>
                    <OtpInput<AuthValues>
                        name="code"
                        label="کد تأیید"
                        length={otp.length}
                        autoFocus
                        disabled={processing || expired}
                        required
                    />
                    <p
                        role="status"
                        className={`text-center text-xs ${expired ? 'text-danger' : 'text-secondary'}`}
                    >
                        {expired
                            ? 'کد منقضی شده است. کد جدید درخواست کنید.'
                            : `زمان باقی‌مانده: ${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')}`}
                    </p>
                    {errors.mobile_number && (
                        <p
                            role="alert"
                            className="text-center text-xs text-danger"
                        >
                            {errors.mobile_number}
                        </p>
                    )}
                </>
            ) : (
                <>
                    <p className="text-center text-sm leading-relaxed text-secondary">
                        برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.
                    </p>
                    <Input<AuthValues>
                        name="mobile_number"
                        label="شماره موبایل"
                        placeholder="09123456789"
                        type="tel"
                        inputMode="tel"
                        autoComplete="off"
                        autoFocus
                        dir="ltr"
                        readOnly={processing}
                    />
                </>
            )}
            <Button
                type="submit"
                disabled={processing || expired || (!otp && retryIn > 0)}
                loading={processing}
                fullWidth
                startIcon={
                    otp ? (
                        <ArrowRight size={17} aria-hidden="true" />
                    ) : (
                        <Smartphone size={17} aria-hidden="true" />
                    )
                }
            >
                {otp
                    ? 'تأیید و ورود'
                    : retryIn > 0
                      ? `تلاش مجدد تا ${retryIn} ثانیه دیگر`
                      : 'ادامه'}
            </Button>
            {otp && (
                <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    disabled={processing || retryIn > 0}
                    onClick={resend}
                    startIcon={<RotateCw size={16} aria-hidden="true" />}
                >
                    {retryIn > 0
                        ? `ارسال مجدد تا ${retryIn} ثانیه دیگر`
                        : 'ارسال مجدد کد'}
                </Button>
            )}
            <PasskeyButton />
        </Form>
    );
}

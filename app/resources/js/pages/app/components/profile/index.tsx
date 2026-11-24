import PasskeyButton from '@/components/passkey_button';
﻿import { router, usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { Save, UserRound, X } from 'lucide-react';
import { Form, Input, FileInput } from '@/components/form';
import { Button } from '@/components/ui';
import { update } from '@/actions/App/Http/Controllers/UserController';
import type { User } from '@/types';

type ProfileValues = {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    mobile_number: string;
    avatar: File | null;
};

function valuesFor(user: User): ProfileValues {
    return {
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        username: user.username ?? '',
        mobile_number: user.mobile_number,
        avatar: null,
    };
}

export default function Profile() {
    const { auth } = usePage().props;
    const user = auth.user;
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [failedImage, setFailedImage] = useState<string | null>(null);
    const [fileVersion, setFileVersion] = useState(0);
    const [saved, setSaved] = useState(false);
    const methods = useForm<ProfileValues>({ defaultValues: valuesFor(user) });
    const file = useWatch({ control: methods.control, name: 'avatar' });
    const name =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || 'کاربر';
    const avatar = user.avatar_url;
    const source = preview ?? avatar;

    useEffect(() => {
        if (!file || !open) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file, open]);

    function show() {
        methods.reset(valuesFor(user));
        setFileVersion((value) => value + 1);
        setSaved(false);
        setOpen(true);
        dialog.current?.showModal();
    }

    function close() {
        if (!processing) dialog.current?.close();
    }

    const submit: SubmitHandler<ProfileValues> = (values) => {
        if (processing) return;
        router.post(
            update().url,
            {
                _method: 'patch',
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                username: values.username,
                ...(values.avatar ? { avatar: values.avatar } : {}),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setSaved(false);
                },
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    methods.reset({ ...values, avatar: null });
                    setFileVersion((value) => value + 1);
                    setSaved(true);
                },
            },
        );
    };

    return (
        <>
            <Button
                variant="tab"
                size="icon"
                onClick={show}
                aria-label="ویرایش پروفایل"
                aria-haspopup="dialog"
                aria-expanded={open}
                tooltip="ویرایش پروفایل"
                className="size-11! shrink-0 overflow-hidden rounded-full! border! border-violet-300/30! bg-linear-to-br from-violet-400/10 to-white/3 p-0! text-violet-200! shadow-[0_0_18px_rgba(139,92,246,0.1)] hover:border-violet-300/60! hover:bg-violet-400/20!"
            >
                {avatar && failedImage !== avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="size-full object-cover"
                        onError={() => setFailedImage(avatar)}
                    />
                ) : (
                    <UserRound size={19} aria-hidden="true" />
                )}
            </Button>
            <dialog
                ref={dialog}
                dir="rtl"
                aria-labelledby={titleId}
                aria-busy={processing}
                onCancel={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
                onClose={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                }}
                style={{ position: 'fixed', inset: 0, margin: 'auto' }}
                className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-[#0d0d0f]/95 p-0 text-zinc-100 shadow-2xl backdrop-blur-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="relative z-10 flex items-center justify-between border-b border-violet-300/15 bg-[#21172f] px-5 py-3">
                    <h2 id={titleId} className="text-base font-semibold">
                        ویرایش پروفایل
                    </h2>
                    <Button
                        variant="tab"
                        size="icon"
                        onClick={close}
                        disabled={processing}
                        aria-label="بستن پروفایل"
                    >
                        <X size={18} aria-hidden="true" />
                    </Button>
                </div>
                <Form
                    methods={methods}
                    onSubmit={submit}
                    isPending={processing}
                    className="grid max-h-[calc(100dvh-7rem)] grid-cols-2 items-start gap-3 overflow-y-auto overscroll-contain p-4 sm:p-5"
                >
                    <div className="flex flex-col items-center gap-2 self-center">
                    <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-violet-300/25 bg-violet-400/10 text-violet-200">
                        {source && failedImage !== source ? (
                            <img
                                src={source}
                                alt="تصویر پروفایل"
                                className="size-full object-cover"
                                onError={() => setFailedImage(source)}
                            />
                        ) : (
                            <UserRound size={32} aria-hidden="true" />
                        )}
                    </div>
                        <p dir="ltr" className="text-sm text-zinc-400">{user.mobile_number}</p>
                    </div>
                    <FileInput<ProfileValues>
                        key={fileVersion}
                        name="avatar"
                        label="تصویر پروفایل"
                        hint="فرمت‌های JPG، PNG و WebP؛ حداکثر ۲ مگابایت"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={processing}
                    />
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                        <Input<ProfileValues>
                            name="first_name"
                            label="نام"
                            maxLength={255}
                            disabled={processing}
                            autoFocus
                        />
                        <Input<ProfileValues>
                            name="last_name"
                            label="نام خانوادگی"
                            maxLength={255}
                            disabled={processing}
                        />
                    </div>
                    <Input<ProfileValues>
                        name="username"
                        label="نام کاربری"
                        dir="ltr"
                        maxLength={255}
                        spellCheck={false}
                        disabled={processing}
                    />
                    <Input<ProfileValues>
                        name="email"
                        label="ایمیل"
                        type="email"
                        dir="ltr"
                        maxLength={255}
                        spellCheck={false}
                        disabled={processing}
                    />
                    <p role="status" className="col-span-2 text-sm text-emerald-300">
                        {saved ? 'اطلاعات پروفایل ذخیره شد.' : ''}
                    </p>
                    <div className="col-span-2 flex gap-3 border-t border-white/8 pt-3">
                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            disabled={processing}
                            startIcon={<Save size={17} aria-hidden="true" />}
                        >
                            ذخیره تغییرات
                        </Button>
                    </div>
                    <div className="col-span-2">
                        <PasskeyButton register />
                    </div>
                </Form>
            </dialog>
        </>
    );
}

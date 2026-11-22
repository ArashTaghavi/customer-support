import { Send } from 'lucide-react';
import { Form, Input } from '@/components/form';
import { Button } from '@/components/ui';
type AskRequest = { question: string };
import type { SubmitHandler, UseFormReturn } from 'react-hook-form';

type Props = {
    questionForm: UseFormReturn<AskRequest>;
    sendQuestion: SubmitHandler<AskRequest>;
    asking: boolean;
    hasQuestion: boolean;
    placeholder: string;
};

export default function ChatQuestionForm({
    questionForm,
    sendQuestion,
    asking,
    hasQuestion,
    placeholder,
}: Props) {
    return (
        <>
            {questionForm.formState.errors.root?.server?.message && (
                <p role="alert" className="px-4 py-2 text-sm text-red-300">
                    {questionForm.formState.errors.root.server.message}
                </p>
            )}
            <Form
                methods={questionForm}
                onSubmit={sendQuestion}
                isPending={asking}
                className="relative mx-auto flex w-full max-w-4xl min-w-0 shrink-0 items-center bg-transparent px-[var(--chat-gutter)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>div]:min-w-0 [&>div]:flex-1 [&>div]:space-y-0 [&>div>label]:sr-only"
            >
                <Input<AskRequest>
                    name="question"
                    label="پیام شما"
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={asking}
                    className="h-14! w-full! rounded-xl! border-0! bg-white/6! ps-4! pe-16! text-base! text-zinc-100! shadow-[0_8px_32px_rgba(0,0,0,0.2)]! backdrop-blur-2xl backdrop-saturate-150 placeholder:text-zinc-300! hover:bg-white/8! focus:bg-white/10! focus:ring-0! sm:text-sm!"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute! end-[calc(var(--chat-gutter)+0.375rem)] top-[1.125rem] h-11! w-11! shrink-0 rounded-lg!"
                    loading={asking}
                    disabled={!hasQuestion || asking}
                    startIcon={<Send size={16} />}
                    aria-label="ارسال پیام"
                ></Button>
            </Form>
        </>
    );
}

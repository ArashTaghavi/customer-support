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
                className="flex min-w-0 shrink-0 items-end gap-2 border-t border-white/10 bg-[#191923]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.7)] sm:gap-3 sm:px-5 [&>div]:min-w-0 [&>div]:flex-1"
            >
                <Input<AskRequest>
                    name="question"
                    label="پیام شما"
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={asking}
                    className="text-base! sm:text-sm!"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="mb-1.5"
                    loading={asking}
                    disabled={!hasQuestion || asking}
                    startIcon={<Send size={16} />}
                    aria-label="ارسال پیام"
                ></Button>
            </Form>
        </>
    );
}

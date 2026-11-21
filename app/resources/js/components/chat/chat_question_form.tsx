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
                className="flex shrink-0 items-end gap-3 border-t border-white/10 bg-[#191923]/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.7)] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
            >
                <Input<AskRequest>
                    name="question"
                    label="پیام شما"
                    placeholder={placeholder}
                    autoComplete="off"
                    dir="auto"
                    disabled={asking}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="mb-1.5"
                    aria-label="ارسال پیام"
                    loading={asking}
                    disabled={!hasQuestion || asking}
                    startIcon={<Send size={16} />}
                ></Button>
            </Form>
        </>
    );
}

import { Send } from 'lucide-react';
import { Form, Textarea } from '@/components/form';
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
                <p role="alert" className="px-4 py-2 text-sm text-danger">
                    {questionForm.formState.errors.root.server.message}
                </p>
            )}
            <Form
                methods={questionForm}
                onSubmit={sendQuestion}
                isPending={asking}
                className="relative mx-auto flex w-full max-w-4xl min-w-0 shrink-0 items-center bg-transparent px-[var(--chat-gutter)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>div]:min-w-0 [&>div]:flex-1 [&>div]:space-y-0 [&>div>label]:sr-only"
            >
                <Textarea<AskRequest>
                    name="question"
                    label="پیام شما"
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={asking}
                    rows={1}
                    onKeyDown={(event) => {
                        if (
                            event.key !== 'Enter' ||
                            event.shiftKey ||
                            event.nativeEvent.isComposing
                        )
                            return;
                        event.preventDefault();
                        if (!event.repeat && hasQuestion && !asking) {
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                    className="glass-composer block field-sizing-content max-h-40 min-h-14 w-full! resize-none! rounded-2xl! border-0! bg-transparent! py-4! ps-4! pe-16! text-base! leading-6! text-foreground! shadow-none! outline-none! placeholder:text-muted focus:ring-0! sm:text-sm!"
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

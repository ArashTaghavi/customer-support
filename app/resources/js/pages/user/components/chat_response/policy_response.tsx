type PolicyResponseProps = {
    message: string;
};

export default function PolicyResponse({ message }: PolicyResponseProps) {
    return (
        <p
            dir="auto"
            className="text-start text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-foreground"
        >
            {message}
        </p>
    );
}

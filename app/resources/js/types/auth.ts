export type User = {
    id: number;
    name?: string;
    first_name: string | null;
    last_name: string | null;
    mobile_number: string;
    username: string | null;
    email: string | null;
    avatar?: string | null;
    avatar_url: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    user: User;
};

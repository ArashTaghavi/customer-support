import { Head } from '@inertiajs/react';
import AuthLayout from './layout';
import LoginCard from './components/login_card';

export default function Auth() {
    return (
        <>
            <Head title="ورود یا ثبت‌نام" />
            <LoginCard />
        </>
    );
}

Auth.layout = AuthLayout;

import { lazy, Suspense, useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
const ThreeDSite = lazy(() => import('../components/3d_site'));
export default function Shop() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return (
        <>
            <Head title="NOVA Showroom" />
            <Suspense fallback={<div className="fixed inset-0 bg-[#090810]" />}>
                {mounted ? (
                    <ThreeDSite />
                ) : (
                    <div className="fixed inset-0 bg-[#090810]" />
                )}
            </Suspense>
        </>
    );
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { index as panel } from '@/routes/app';
import LoginModal from '../components/login_modal';
const ThreeDSite = lazy(() => import('../components/3d_site'));
export default function Shop() {
    const { auth } = usePage<{ auth: { user: unknown | null } }>().props;
    const [loginOpen, setLoginOpen] = useState(false);
    const [entryStage, setEntryStage] = useState<
        'idle' | 'walking' | 'transition'
    >('idle');
    const navigating = useRef(false);
    const enteringPanel = entryStage !== 'idle';
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    function enterUserPanel() {
        if (auth.user) {
            setEntryStage('walking');
        } else {
            setLoginOpen(true);
        }
    }

    function finishShowroomLogin() {
        setLoginOpen(false);
        setEntryStage('walking');
    }

    function openPanel() {
        if (navigating.current) return;
        navigating.current = true;
        router.visit(panel(), {
            onFinish: () => {
                navigating.current = false;
                setEntryStage('idle');
            },
        });
    }
    return (
        <>
            <Head title="NOVA Showroom" />
            <Suspense fallback={<div className="fixed inset-0 bg-[#090810]" />}>
                {mounted ? (
                    <ThreeDSite
                        onUserRoomEnter={enterUserPanel}
                        robotEnabled={!loginOpen && !enteringPanel}
                        panelEntering={enteringPanel}
                        panelSeated={entryStage === 'transition'}
                        onPanelSeated={() => setEntryStage('transition')}
                    />
                ) : (
                    <div className="fixed inset-0 bg-[#090810]" />
                )}
            </Suspense>
            {loginOpen && (
                <LoginModal
                    onClose={() => setLoginOpen(false)}
                    onAuthenticated={finishShowroomLogin}
                />
            )}
            {entryStage === 'transition' && (
                <div
                    className="panel-route-transition"
                    aria-hidden="true"
                    onAnimationEnd={(event) => {
                        if (event.target === event.currentTarget) openPanel();
                    }}
                />
            )}
        </>
    );
}

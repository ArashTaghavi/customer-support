import { Component, Suspense, useMemo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

class PreviewBoundary extends Component<
    { children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        return this.state.failed ? (
            <p role="alert" className="p-6 text-sm text-muted">
                This model could not be previewed. You can still download or
                replace it.
            </p>
        ) : (
            this.props.children
        );
    }
}
function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const object = useMemo(() => clone(scene), [scene]);
    return <primitive object={object} dispose={null} />;
}
export default function ModelPreview({ url }: { url: string }) {
    return (
        <PreviewBoundary key={url}>
            <div
                className="h-72 overflow-hidden rounded-xl bg-linear-to-b from-elevated to-canvas"
                aria-label="3D product preview"
            >
                <Canvas
                    camera={{ position: [4, 3, 4], fov: 40 }}
                    dpr={[1, 1.5]}
                >
                    <ambientLight intensity={1.4} />
                    <directionalLight position={[4, 5, 3]} intensity={3} />
                    <directionalLight position={[-3, 2, -2]} intensity={1} />
                    <Suspense fallback={null}>
                        <Bounds fit clip observe margin={1.3}>
                            <Center>
                                <Model url={url} />
                            </Center>
                        </Bounds>
                    </Suspense>
                    <OrbitControls makeDefault enableDamping />
                </Canvas>
            </div>
        </PreviewBoundary>
    );
}

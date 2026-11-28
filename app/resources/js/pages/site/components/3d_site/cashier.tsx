import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

type Position = [number, number, number];

export default function Cashier({ position }: { position: Position }) {
    const { scene } = useGLTF('/models/showroom/cashier-seated.glb');
    const person = useMemo(() => {
        const model = clone(scene);
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model, true);
        const center = bounds.getCenter(new THREE.Vector3());
        // Preserve the seated pose's depth origin so the hips align with the chair.
        model.position.x -= center.x;
        model.position.y -= bounds.min.y;
        model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        return model;
    }, [scene]);

    return (
        <group name="checkout-cashier" position={position}>
            <primitive object={person} dispose={null} />
        </group>
    );
}

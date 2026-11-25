import { _roots } from '@react-three/fiber';
import * as THREE from 'three';
(window as any).qaState = () => _roots.get(document.querySelector('canvas')!)?.store.getState();
(window as any).qaCenter = (id: number) => {
    const state = (window as any).qaState();
    const group = state.scene.getObjectByName(`product-${id}`);
    const center = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3()).project(state.camera);
    return { x: (center.x + 1) * innerWidth / 2, y: (1 - center.y) * innerHeight / 2 };
};

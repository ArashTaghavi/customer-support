import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const tablePositions: [number, number][] = [
    [-2.6, -0.7],
    [2.6, -0.7],
    [-2.6, 2.6],
    [2.6, 2.6],
];
export const tableViews = ['phones', 'laptops', 'gaming', 'accessories'];
export const userRoomEntrance = { x: 3.675, z: -2.82, halfWidth: 0.59 };
export const userRoomDeskZ = -4.88;
export const userRoomChairZ = userRoomDeskZ - 1.04;
export const checkoutEntrance = { ...userRoomEntrance, x: -userRoomEntrance.x };
export const checkoutStop = { x: checkoutEntrance.x, z: userRoomDeskZ + 1.15 };
export const checkoutBackZ = -6.9;
const floorWidth = 15;
const floorDepth = 13.5;
const floorZ = -0.3;

// Apply the same baked falloff to the core and the individual flutes. Their
// geometries are centred at the same height, including the instanced flutes.
function tableWash(shader: THREE.WebGLProgramParametersWithUniforms) {
    shader.vertexShader =
        'varying float vFluteHeight;\n' +
        shader.vertexShader.replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\n vFluteHeight = position.y;',
        );
    shader.fragmentShader =
        'varying float vFluteHeight;\n' +
        shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
        float topWash = exp(-5.6 * max(0.0, 0.46 - vFluteHeight));
        float toeWash = exp(-8.0 * max(0.0, vFluteHeight + 0.46));
        totalEmissiveRadiance += vec3(0.23, 0.052, 0.40) * (topWash + 0.62 * toeWash);`,
        );
}

export function TableFinish({ fluted = false }: { fluted?: boolean }) {
    return (
        <meshStandardMaterial
            color={fluted ? '#48404e' : '#292531'}
            metalness={0.38}
            roughness={0.39}
            onBeforeCompile={tableWash}
        />
    );
}

function floorTextures() {
    const size = 512;
    const stone = new Uint8Array(size * size * 4);
    const light = new Uint8Array(stone.length);
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const i = (row * size + col) * 4;
            const x = ((col + 0.5) / size - 0.5) * floorWidth;
            const z = floorZ + (0.5 - (row + 0.5) / size) * floorDepth;
            const grain = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
            const tileX = x / 1.35,
                tileZ = z / 1.35;
            const joint = Math.min(
                Math.abs(tileX - Math.round(tileX)),
                Math.abs(tileZ - Math.round(tileZ)),
            );
            const tone =
                51 +
                (grain - Math.floor(grain)) * 2.5 +
                1.7 * Math.sin(Math.floor(tileX) * 5 + Math.floor(tileZ) * 3) +
                16 * Math.max(0, 1 - joint / 0.012);
            stone[i] = tone;
            stone[i + 1] = tone - 3;
            stone[i + 2] = tone + 8;
            stone[i + 3] = 255;

            let spill = 0;
            for (const [centerX, centerZ] of tablePositions) {
                // Distance from the rounded toe kick, in metres. One floor
                // texture carries all table reflections, in both modes.
                const dx = Math.max(0, Math.abs(x - centerX) - 1.61);
                const dz = Math.max(0, Math.abs(z - centerZ) - 0.56);
                const distance = Math.max(0, Math.hypot(dx, dz) - 0.13);
                spill +=
                    0.75 * Math.exp(-5.8 * distance) +
                    0.25 * Math.exp(-2.1 * distance);
            }
            light[i] = 55 * spill;
            light[i + 1] = 10 * spill;
            light[i + 2] = 104 * spill;
            light[i + 3] = 255;
        }
    }
    const makeTexture = (
        data: Uint8Array<ArrayBuffer>,
        colorSpace: THREE.ColorSpace,
    ) => {
        const texture = new THREE.DataTexture(data, size, size);
        texture.colorSpace = colorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        texture.needsUpdate = true;
        return texture;
    };
    return {
        stone: makeTexture(stone, THREE.SRGBColorSpace),
        spill: makeTexture(light, THREE.LinearSRGBColorSpace),
    };
}

export function ShowroomFloor() {
    const maps = useMemo(floorTextures, []);
    useEffect(
        () => () => {
            maps.stone.dispose();
            maps.spill.dispose();
        },
        [maps],
    );
    return (
        <mesh
            name="showroom-floor"
            rotation-x={-Math.PI / 2}
            position={[0, 0, floorZ]}
            receiveShadow
        >
            <planeGeometry args={[floorWidth, floorDepth]} />
            <meshStandardMaterial
                map={maps.stone}
                emissive="white"
                emissiveMap={maps.spill}
                roughness={0.37}
                metalness={0.18}
                envMapIntensity={0.72}
            />
        </mesh>
    );
}

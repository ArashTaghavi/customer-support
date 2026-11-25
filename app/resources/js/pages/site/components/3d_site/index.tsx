import React, {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    Suspense,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    RoundedBox,
    Environment,
    Lightformer,
    Text,
    ContactShadows,
    useGLTF,
} from '@react-three/drei';
import { EffectComposer, Bloom, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ShowroomFloor, TableFinish, tableCenters, tableZ } from './surfaces';
import './showroom.css';
import font from '../../../../../fonts/vazirmatn-400-normal-GKyMcI03.woff';
type V = [number, number, number];
const purple = '#a35bff';
const InterfaceVisible = React.createContext(false);
function Box({
    p = [0, 0, 0],
    s,
    c = '#24232c',
    r = 0.04,
    metal = 0.3,
    rough = 0.35,
    glow = false,
    children,
}: {
    p?: V;
    s: V;
    c?: string;
    r?: number;
    metal?: number;
    rough?: number;
    glow?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <RoundedBox
            position={p}
            args={s}
            radius={Math.min(r, ...s.map((v) => v / 3))}
            smoothness={2}
            bevelSegments={2}
            castShadow={!glow}
            receiveShadow
        >
            {children ?? (
                <meshStandardMaterial
                    color={c}
                    metalness={metal}
                    roughness={rough}
                    emissive={glow ? c : '#000'}
                    emissiveIntensity={glow ? 2.8 : 0}
                />
            )}
        </RoundedBox>
    );
}
function Sign({
    p,
    children,
    size = 0.22,
}: {
    p: V;
    children: React.ReactNode;
    size?: number;
}) {
    const visible = React.useContext(InterfaceVisible);
    if (!visible) return null;
    return (
        <Text
            font={font}
            position={p}
            fontSize={size}
            color="#e9dfff"
            anchorX="center"
            anchorY="middle"
        >
            {children}
        </Text>
    );
}
// Regular architectural details share a geometry, a material and a draw call.
function Slats({
    p,
    step,
    s,
    count,
    children,
}: {
    p: V;
    step: V;
    s: V;
    count: number;
    children: React.ReactNode;
}) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const [dx, dy, dz] = step;
    useLayoutEffect(() => {
        if (!mesh.current) return;
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            mesh.current.setMatrixAt(
                i,
                matrix.makeTranslation(i * dx, i * dy, i * dz),
            );
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.computeBoundingSphere();
    }, [count, dx, dy, dz]);
    return (
        <instancedMesh
            ref={mesh}
            args={[undefined, undefined, count]}
            position={p}
            receiveShadow
        >
            <boxGeometry args={s} />
            {children}
        </instancedMesh>
    );
}
const models = [
    ['smartphone', 'camera-phone', 'foldable-phone'],
    ['gaming-laptop', 'thin-laptop', 'business-laptop'],
    [
        'over-ear-headphones',
        'studio-headphones',
        'gaming-headset',
        'wireless-earbuds',
    ],
];
function ProductModel({
    name,
    p,
    height,
    yaw = 0,
}: {
    name: string;
    p: V;
    height: number;
    yaw?: number;
}) {
    const { scene } = useGLTF('/models/showroom/' + name + '.glb');
    const object = React.useMemo(() => {
        const copy = scene.clone(true);
        copy.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(copy, true);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const wrapper = new THREE.Group();
        copy.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
        copy.traverse((o) => {
            if (o instanceof THREE.Mesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                if (name === 'executive-chair') {
                    const blackMaterial = (material: THREE.Material) => {
                        const copy = material.clone();
                        if (copy instanceof THREE.MeshStandardMaterial) {
                            copy.color.set('#080808');
                            copy.map = null;
                            copy.emissive.set('#000000');
                            copy.emissiveMap = null;
                            copy.roughness = 0.58;
                        }
                        return copy;
                    };
                    o.material = Array.isArray(o.material)
                        ? o.material.map(blackMaterial)
                        : blackMaterial(o.material);
                }
            }
        });
        wrapper.add(copy);
        wrapper.scale.setScalar(height / Math.max(size.y, 0.001));
        return wrapper;
    }, [scene, height, name]);
    return (
        <primitive
            name={name}
            object={object}
            position={p}
            rotation-y={yaw}
            dispose={null}
        />
    );
}
function Table({
    p,
    label,
    kind,
    onPick,
}: {
    p: V;
    label: string;
    kind: number;
    onPick: (s: string) => void;
}) {
    return (
        <group name={label} position={p}>
            <Box p={[0, 0.09, 0]} s={[3.55, 0.18, 1.45]} c="#171720" />
            <Box p={[0, 0.62, 0]} s={[2.85, 0.95, 0.85]} r={0.12}>
                <TableFinish />
            </Box>
            <Box p={[0, 1.08, 0]} s={[3.7, 0.035, 1.6]} c={purple} glow />
            <Box
                p={[0, 1.17, 0]}
                s={[3.8, 0.16, 1.68]}
                c="#494551"
                r={0.1}
                metal={0.65}
                rough={0.24}
            />
            <Slats
                p={[-1.32, 0.62, 0.44]}
                s={[0.045, 0.82, 0.035]}
                step={[0.115, 0, 0]}
                count={24}
            >
                <TableFinish fluted />
            </Slats>
            <Sign p={[0, 0.75, 0.47]} size={0.18}>
                {label}
            </Sign>
            {Array.from({ length: models[kind].length }, (_, i) => (
                <group
                    key={i}
                    position={[
                        (i - (models[kind].length - 1) / 2) *
                            (kind === 1 ? 1.13 : 0.86),
                        1.25,
                        0,
                    ]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPick(models[kind][i]);
                    }}
                >
                    <Box p={[0, 0.035, 0]} s={[0.65, 0.07, 0.55]} c="#35313d" />
                    <ProductModel
                        name={models[kind][i]}
                        p={[0, 0.07, 0]}
                        height={
                            kind === 0
                                ? 0.42
                                : kind === 1
                                  ? 0.4
                                  : i === 3
                                    ? 0.12
                                    : 0.34
                        }
                    />
                    <Sign p={[0, 0.035, 0.31]} size={0.065}>
                        {models[kind][i].replaceAll('-', ' ')}
                    </Sign>
                </group>
            ))}
        </group>
    );
}
function Sofa({ p, rot = 0 }: { p: V; rot?: number }) {
    return (
        <group name="three-seat-sofa" position={p} rotation={[0, rot, 0]}>
            <Box p={[0, 0.045, 0]} s={[2.45, 0.09, 0.86]} c="#191820" />
            <Box p={[0, 0.2, 0]} s={[2.65, 0.25, 1.05]} c="#191922" r={0.14} />
            <Box
                p={[0, 0.72, -0.43]}
                s={[2.65, 0.85, 0.25]}
                c="#393443"
                r={0.13}
                rough={0.85}
            />
            {[-0.78, 0, 0.78].map((x) => (
                <Box
                    key={x}
                    p={[x, 0.43, 0.02]}
                    s={[0.76, 0.25, 0.8]}
                    c="#45404e"
                    r={0.12}
                    rough={0.85}
                />
            ))}
            {[-1.22, 1.22].map((x) => (
                <Box
                    key={x}
                    p={[x, 0.58, 0]}
                    s={[0.24, 0.55, 1]}
                    c="#393443"
                    r={0.1}
                />
            ))}
        </group>
    );
}
function Lounge({ side }: { side: -1 | 1 }) {
    // The backrest is on local -Z. Both seating fronts and their tables
    // therefore face the aisle when the whole arrangement is mirrored.
    return (
        <group
            name={side < 0 ? 'left-lounge' : 'right-lounge'}
            position={[side * 6.38, 0, 3.95]}
            rotation-y={(-side * Math.PI) / 2}
        >
            <Sofa p={[0, 0, 0]} />
            <group name="coffee-table" position={[0, 0, 1.4]}>
                <Box p={[0, 0.06, 0]} s={[1.32, 0.12, 0.49]} c="#25222d" />
                <Box
                    p={[0, 0.22, 0]}
                    s={[1.45, 0.26, 0.54]}
                    c="#302c37"
                    r={0.09}
                />
                <Box
                    p={[0, 0.39, 0]}
                    s={[1.83, 0.1, 0.72]}
                    c="#585260"
                    r={0.08}
                    rough={0.28}
                    metal={0.52}
                />
            </group>
        </group>
    );
}

// The exterior walls enclose both rooms. Only the divider and the two
// glazed shopfronts are interior walls. Dimensions refer to finished faces.
const rearZ = -6.9,
    officeFrontZ = -2.82,
    sideWallX = 7.35,
    wallThickness = 0.15;
const innerEdgeX = sideWallX - wallThickness / 2;
const roomWidth = innerEdgeX - wallThickness / 2;
const officeCenter = (innerEdgeX + wallThickness / 2) / 2;
const deskZ = -4.88,
    deskTop = 0.83;

function Glass({ p, s }: { p: V; s: V }) {
    return (
        <mesh position={p}>
            <boxGeometry args={s} />
            <meshPhysicalMaterial
                color="#aca3c3"
                transparent
                opacity={0.12}
                roughness={0.16}
                metalness={0.18}
                clearcoat={0.65}
                depthWrite={false}
            />
        </mesh>
    );
}

function GlassDoor({ side, width }: { side: number; width: number }) {
    const [open, setOpen] = useState(false);
    const hinge = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (hinge.current) {
            hinge.current.rotation.y = THREE.MathUtils.damp(
                hinge.current.rotation.y,
                open ? -side * Math.PI / 2 : 0,
                7,
                dt,
            );
        }
    });
    const center = -side * width / 2;
    return (
        <group
            ref={hinge}
            position={[side * width / 2, 0, officeFrontZ]}
            onClick={(event) => {
                event.stopPropagation();
                setOpen((value) => !value);
            }}
        >
            <Glass p={[center, 1.38, 0]} s={[width - 0.07, 2.66, 0.035]} />
            {[0.055, 2.705].map((y) => (
                <Box key={y} p={[center, y, 0]} s={[width - 0.04, 0.045, 0.055]} c="#726879" />
            ))}
            {[-1, 1].map((edge) => (
                <Box key={edge} p={[center + edge * (width / 2 - 0.035), 1.38, 0]} s={[0.035, 2.65, 0.055]} c="#726879" />
            ))}
            <Box p={[-side * (width - 0.15), 1.2, 0.08]} s={[0.035, 0.34, 0.055]} c="#bcb8c3" metal={0.9} />
        </group>
    );
}

function Office({ x, label }: { x: number; label: string }) {
    const doorSide = Math.sign(x);
    const entranceWidth = 1.18;
    const glassWidth = (roomWidth - entranceWidth) / 2;
    return (
        <group name={label} position-x={x}>
            <Box
                p={[0, 2.9, officeFrontZ]}
                s={[roomWidth, 0.3, 0.16]}
                c="#302a39"
                metal={0.5}
            />
            <Box
                p={[0, 3.058, officeFrontZ]}
                s={[roomWidth, 0.022, 0.14]}
                c={purple}
                glow
            />
            <Box p={[0, 2.74, officeFrontZ - 0.025]} s={[roomWidth - 0.10, 0.018, 0.055]} c="#c998ff" glow />
            <pointLight position={[0, 2.35, rearZ + 0.85]} color="#bb81ff" intensity={10} distance={5.4} />
            <Sign p={[0, 2.9, officeFrontZ + 0.087]} size={0.185}>
                {label}
            </Sign>
            {[-1, 1].map((side) => {
                const panelX = (side * (entranceWidth + glassWidth)) / 2;
                return (
                    <group key={side}>
                        <Box p={[panelX, 0.068, officeFrontZ + 0.021]} s={[glassWidth - 0.06, 0.015, 0.026]} c="#9752d8" glow />
                        <Glass
                            p={[panelX, 1.39, officeFrontZ]}
                            s={[glassWidth - 0.035, 2.72, 0.028]}
                        />
                        <Box
                            p={[
                                (side * entranceWidth) / 2,
                                1.375,
                                officeFrontZ,
                            ]}
                            s={[0.033, 2.75, 0.055]}
                            c="#79727f"
                        />
                        <Box
                            p={[panelX, 0.032, officeFrontZ]}
                            s={[glassWidth, 0.064, 0.065]}
                            c="#726879"
                        />
                        <Box
                            p={[panelX, 1.06, officeFrontZ + 0.018]}
                            s={[glassWidth - 0.14, 0.016, 0.004]}
                            c="#99909e"
                        />
                    </group>
                );
            })}
            <GlassDoor side={doorSide} width={entranceWidth} />
            <Box
                p={[0, deskTop - 0.06, deskZ]}
                s={[2.7, 0.12, 1.05]}
                c="#554d59"
                rough={0.34}
            />
            {[-1, 1].map((dx) => (
                <Box
                    key={dx}
                    p={[dx, 0.355, deskZ]}
                    s={[0.42, 0.71, 0.9]}
                    c="#292832"
                />
            ))}
            <ProductModel
                name="executive-chair"
                p={[0, 0, deskZ - 1.04]}
                height={1.45}
            />
            <ProductModel
                name="thin-laptop"
                p={[0, deskTop, deskZ - 0.08]}
                height={0.34}
                yaw={Math.PI}
            />
            <group
                name="wall-cabinet"
                position={[doorSide * 2.22, 0, rearZ + 0.31]}
            >
                <Box p={[0, 0.37, 0]} s={[1.9, 0.74, 0.49]} c="#302d36" />
                <Box p={[0, 1.24, -0.225]} s={[1.9, 1.0, 0.048]} c="#513c36" />
                <pointLight position={[0, 1.58, 0.05]} color="#ffc291" intensity={1.3} distance={1.85} />
                {[1.21, 1.77].map((y) => (
                    <group key={y}>
                        <Box
                            p={[0, y, 0]}
                            s={[1.93, 0.045, 0.48]}
                            c="#59505d"
                        />
                        <Box
                            p={[0, y - 0.032, 0.16]}
                            s={[1.78, 0.016, 0.025]}
                            c="#ffc18d"
                            glow
                        />
                    </group>
                ))}
                <Slats
                    p={[-0.65, 1.39, 0]}
                    s={[0.062, 0.3, 0.2]}
                    step={[0.081, 0, 0]}
                    count={5}
                >
                    <meshStandardMaterial color="#89828b" roughness={0.76} />
                </Slats>
            </group>
        </group>
    );
}

function Architecture() {
    const partitionDepth = officeFrontZ - rearZ;
    return (
        <group name="architecture">
            <Box p={[0, 1.55, rearZ - 0.1]} s={[14.85, 3.1, 0.2]} c="#201e29" />
            <Slats
                p={[-7.04, 1.51, rearZ + 0.018]}
                step={[0.45, 0, 0]}
                s={[0.028, 2.98, 0.036]}
                count={32}
            >
                <meshStandardMaterial
                    color="#504755"
                    metalness={0.45}
                    roughness={0.43}
                />
            </Slats>
            <Box
                p={[0, 3.08, rearZ + 0.026]}
                s={[14.72, 0.028, 0.055]}
                c={purple}
                glow
            />
            <Box
                p={[0, 1.53, (officeFrontZ + rearZ) / 2]}
                s={[wallThickness, 3.06, partitionDepth]}
                c="#302b39"
            />
            {[-1, 1].map((side) => {
                const x = side * sideWallX;
                return (
                    <group key={side}>
                        {side < 0 ? (
                            <>
                                <Box
                                    p={[x, 1.55, -3.62]}
                                    s={[wallThickness, 3.1, 6.56]}
                                    c="#252131"
                                />
                                <Slats
                                    p={[x + 0.094, 1.5, -6.67]}
                                    s={[0.045, 2.96, 0.08]}
                                    step={[0, 0, 0.48]}
                                    count={14}
                                >
                                    <meshStandardMaterial
                                        color="#524858"
                                        metalness={0.4}
                                        roughness={0.4}
                                    />
                                </Slats>
                            </>
                        ) : (
                            <Glass
                                p={[x, 1.49, (officeFrontZ + rearZ) / 2]}
                                s={[wallThickness, 2.98, partitionDepth]}
                            />
                        )}
                        <Box
                            p={[
                                x,
                                3.06,
                                (rearZ + (side < 0 ? -0.34 : officeFrontZ)) / 2,
                            ]}
                            s={[
                                wallThickness,
                                0.08,
                                side < 0 ? 6.56 : partitionDepth,
                            ]}
                            c="#514553"
                        />
                        <Box
                            p={[
                                x - side * 0.04,
                                3.104,
                                (rearZ + (side < 0 ? -0.34 : officeFrontZ)) / 2,
                            ]}
                            s={[0.049, 0.016, side < 0 ? 6.56 : partitionDepth]}
                            c={purple}
                            glow
                        />
                        <Box
                            p={[x, 1.525, officeFrontZ]}
                            s={[wallThickness, 3.05, 0.1]}
                            c="#3e3846"
                        />
                        <Box
                            p={[side * 7.4, 0.014, -0.3]}
                            s={[0.035, 0.024, 13.42]}
                            c={purple}
                            glow
                        />
                    </group>
                );
            })}
            <Box
                p={[0, 0.014, 6.39]}
                s={[14.83, 0.024, 0.035]}
                c={purple}
                glow
            />
            <Box
                p={[0, -0.105, -0.3]}
                s={[15, 0.2, 13.5]}
                c="#24212c"
                r={0.06}
            />
        </group>
    );
}
function Scene({
    view,
    onPick,
    quality,
}: {
    view: string;
    onPick: (s: string) => void;
    quality: boolean;
}) {
    const { camera: responsiveCamera, size } = useThree();
    useEffect(() => {
        if (responsiveCamera instanceof THREE.PerspectiveCamera) {
            responsiveCamera.fov = size.width < size.height ? 75 : 43;
            responsiveCamera.updateProjectionMatrix();
        }
    }, [responsiveCamera, size.width, size.height]);
    const controls = useRef<any>(null);
    const target = useRef<V>([0, 0, 0]);
    const dest = useRef<V>([12, 10, 15]);
    useEffect(() => {
        const map: Record<string, [V, V]> = {
            overview: [
                [12, 10, 15],
                [0, 0, -1],
            ],
            phones: [
                [-6, 4, 7],
                [-4, 1, 1],
            ],
            laptops: [
                [0, 4, 7],
                [0, 1, 1],
            ],
            audio: [
                [6, 4, 7],
                [4, 1, 1],
            ],
            management: [
                [-4.6, 2.15, -0.4],
                [-officeCenter, 0.95, deskZ],
            ],
            user: [
                [4.6, 2.15, -0.4],
                [officeCenter, 0.95, deskZ],
            ],
            lounge: [
                [0.8, 4.5, 8.2],
                [5.6, 0.5, 3.95],
            ],
        };
        [dest.current, target.current] = map[view] || map.overview;
        moving.current = true;
    }, [view]);
    const moving = useRef(true);
    const waypoint = React.useMemo(() => new THREE.Vector3(), []);
    useFrame(({ camera }, dt) => {
        if (moving.current && controls.current) {
            camera.position.lerp(
                waypoint.set(...dest.current),
                1 - Math.exp(-dt * 4),
            );
            controls.current.target.lerp(
                waypoint.set(...target.current),
                1 - Math.exp(-dt * 4),
            );
            controls.current.update();
            if (
                camera.position.distanceTo(waypoint.set(...dest.current)) < 0.03
            )
                moving.current = false;
        }
    });
    return (
        <>
            <color attach="background" args={['#090810']} />
            <ambientLight intensity={0.23} />
            <Environment resolution={256}>
                <Lightformer
                    intensity={3}
                    position={[0, 8, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[12, 8, 1]}
                />
                <Lightformer
                    intensity={4}
                    color="#b18aff"
                    position={[-7, 4, 2]}
                    scale={[5, 5, 1]}
                />
                <Lightformer
                    intensity={2}
                    position={[7, 3, 4]}
                    scale={[5, 5, 1]}
                />
            </Environment>
            <directionalLight
                position={[3, 9, 6]}
                intensity={2.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-normalBias={0.035}
            />
            <ShowroomFloor />
            <Architecture />
            <Office x={-officeCenter} label="MANAGEMENT" />
            <Office x={officeCenter} label="USER STUDIO" />
            {tableCenters.map((x, i) => (
                <Table
                    key={x}
                    p={[x, 0, tableZ]}
                    kind={i}
                    label={['SMARTPHONES', 'LAPTOPS', 'AUDIO'][i]}
                    onPick={onPick}
                />
            ))}
            <Lounge side={-1} />
            <Lounge side={1} />
            <ContactShadows
                frames={1}
                position={[0, 0.002, 0]}
                opacity={0.4}
                scale={18}
                blur={2.5}
                far={3}
                resolution={512}
            />
            <OrbitControls
                ref={controls}
                makeDefault
                enableDamping
                enablePan={false}
                minDistance={2.5}
                maxDistance={22.4}
                minPolarAngle={0.25}
                maxPolarAngle={Math.PI / 2 - 0.08}
                onStart={() => (moving.current = false)}
            />
            {quality && (
                <EffectComposer multisampling={2}>
                    <N8AO
                        halfRes
                        quality="performance"
                        aoRadius={0.45}
                        intensity={1.3}
                    />
                    <Bloom
                        intensity={0.55}
                        luminanceThreshold={1.2}
                        mipmapBlur
                    />
                </EffectComposer>
            )}
        </>
    );
}
export default function ThreeDSite() {
    const [interfaceVisible, setInterfaceVisible] = useState(false);
    const [view, setView] = useState('overview'),
        [quality, setQuality] = useState(true),
        [selected, setSelected] = useState('');
    return (
        <InterfaceVisible.Provider value={interfaceVisible}>
            <main className={`imported-showroom${interfaceVisible ? '' : ' interface-hidden'}`} dir="ltr">
                <button
                    type="button"
                    className="interface-toggle"
                    aria-label={interfaceVisible ? 'مخفی کردن متن‌ها و دکمه‌ها' : 'نمایش متن‌ها و دکمه‌ها'}
                    aria-pressed={interfaceVisible}
                    onClick={() => {
                        setInterfaceVisible((value) => !value);
                        setSelected('');
                    }}
                >
                    {interfaceVisible ? 'مخفی کردن رابط' : 'نمایش رابط'}
                </button>
                <header>
                    <div>
                        <small>IMMERSIVE RETAIL EXPERIENCE</small>
                        <h1>
                            NOVA<span> / </span>SHOWROOM III
                        </h1>
                    </div>
                    <button onClick={() => setQuality(!quality)}>
                        {quality ? 'HIGH QUALITY' : 'PERFORMANCE'}
                    </button>
                </header>
                <section className="viewport">
                    <Canvas
                        shadows
                        dpr={[1, quality ? 2 : 1]}
                        camera={{ position: [12, 10, 15], fov: 43 }}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                        }}
                    >
                        <Suspense fallback={null}>
                            <Scene
                                view={view}
                                quality={quality}
                                onPick={(name) => { if (interfaceVisible) setSelected(name); }}
                            />
                        </Suspense>
                    </Canvas>
                    <div className="overlay">
                        <small>01 / VIRTUAL SHOWROOM</small>
                        <h2>
                            Technology.
                            <br />
                            Reimagined.
                        </h2>
                        <p>Drag to orbit · Scroll to zoom</p>
                    </div>
                    {selected && (
                        <aside>
                            <button onClick={() => setSelected('')}>×</button>
                            <small>SELECTED PRODUCT</small>
                            <h3>{selected}</h3>
                            <p>External GLB model · CC BY 4.0</p>
                        </aside>
                    )}
                </section>
                <nav>
                    {Object.entries({
                        overview: 'Overview',
                        phones: 'Smartphones',
                        laptops: 'Laptops',
                        audio: 'Audio',
                        management: 'Management',
                        user: 'User studio',
                        lounge: 'Lounge',
                    }).map(([k, v]) => (
                        <button
                            className={view === k ? 'active' : ''}
                            key={k}
                            onClick={() => setView(k)}
                        >
                            {v}
                        </button>
                    ))}
                </nav>
                <footer>
                    3D assets: vinish.dev · CC BY 4.0 <span>● INTERACTIVE</span>
                </footer>
            </main>
        </InterfaceVisible.Provider>
    );
}

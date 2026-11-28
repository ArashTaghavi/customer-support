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
    Html,
} from '@react-three/drei';
import { EffectComposer, Bloom, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Link } from '@inertiajs/react';
import { show as showProduct } from '@/routes/products';
import { clone as cloneModel } from 'three/addons/utils/SkeletonUtils.js';
import type { ShowroomProduct, ShowroomTable } from './types';
import { Eye, EyeOff, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    ShowroomFloor,
    TableFinish,
    tablePositions,
    tableViews,
    userRoomEntrance,
    userRoomDeskZ,
} from './surfaces';
import RobotController, { type RobotDestination } from './robot_controller';
import CategoryModal from './category_modal';
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
    alwaysVisible = false,
}: {
    p: V;
    children: React.ReactNode;
    size?: number;
    alwaysVisible?: boolean;
}) {
    const visible = React.useContext(InterfaceVisible);
    if (!visible && !alwaysVisible) return null;
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
class ProductModelBoundary extends React.Component<
    { children: React.ReactNode },
    { failed: boolean }
> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        return this.state.failed ? (
            <Box p={[0, 0.13, 0]} s={[0.2, 0.25, 0.2]} c="#59456d" />
        ) : (
            this.props.children
        );
    }
}
function ProductModel({
    name,
    p,
    height,
    yaw = 0,
    url,
    maxWidth,
    maxDepth,
}: {
    name: string;
    p: V;
    height: number;
    yaw?: number;
    url?: string;
    maxWidth?: number;
    maxDepth?: number;
}) {
    const { scene } = useGLTF(url ?? '/models/showroom/' + name + '.glb');
    const object = React.useMemo(() => {
        const copy = cloneModel(scene);
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
                if (!url && name === 'executive-chair') {
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
        wrapper.scale.setScalar(
            Math.min(
                height / Math.max(size.y, 0.001),
                maxWidth === undefined
                    ? Infinity
                    : maxWidth / Math.max(size.x, 0.001),
                maxDepth === undefined
                    ? Infinity
                    : maxDepth / Math.max(size.z, 0.001),
            ),
        );
        return wrapper;
    }, [scene, height, name, url, maxWidth, maxDepth]);
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
    products,
    onPick,
    showPagination,
}: {
    p: V;
    label: string;
    kind: number;
    products: ShowroomProduct[];
    onPick: (product: ShowroomProduct) => void;
    showPagination: boolean;
}) {
    const [page, setPage] = useState(0);
    const capacity = kind === 1 ? 3 : 4;
    const pages = Math.max(1, Math.ceil(products.length / capacity));
    const current = Math.min(page, pages - 1);
    const items = products.slice(current * capacity, (current + 1) * capacity);
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
            <Sign p={[0, 0.75, 0.47]} size={0.18} alwaysVisible>
                {label}
            </Sign>
            {items.map((product, i) => (
                <group
                    key={`${product.id}:${product.model_url}`}
                    name={`product-${product.id}`}
                    userData={{
                        productId: product.id,
                        modelUrl: product.model_url,
                    }}
                    position={[
                        (i - (items.length - 1) / 2) *
                            (kind === 1 ? 1.13 : 0.86),
                        1.25,
                        0,
                    ]}
                    onClick={(event) => {
                        event.stopPropagation();
                        onPick(product);
                    }}
                >
                    <Box
                        p={[0, 0.035, 0]}
                        s={[
                            kind === 1 ? 0.98 : 0.65,
                            0.07,
                            kind === 1 ? 0.75 : 0.55,
                        ]}
                        c="#35313d"
                    />
                    <ProductModelBoundary key={product.model_url}>
                        <Suspense
                            fallback={
                                <Box
                                    p={[0, 0.1, 0]}
                                    s={[0.12, 0.12, 0.12]}
                                    c={purple}
                                />
                            }
                        >
                            <ProductModel
                                name={product.title}
                                url={product.model_url ?? undefined}
                                p={[0, 0.07, 0]}
                                height={
                                    kind === 0
                                        ? 0.42
                                        : kind === 1
                                          ? 0.4
                                          : kind === 3
                                            ? 0.24
                                            : 0.34
                                }
                                maxWidth={
                                    kind === 1 ? 1.03 : kind === 3 ? 0.5 : 0.65
                                }
                                maxDepth={
                                    kind === 1 ? 0.8 : kind === 3 ? 0.42 : 0.55
                                }
                            />
                        </Suspense>
                    </ProductModelBoundary>
                    <Sign p={[0, 0.035, kind === 1 ? 0.41 : 0.31]} size={0.065}>
                        {product.title.length > 24
                            ? product.title.slice(0, 23) + '?'
                            : product.title}
                    </Sign>
                </group>
            ))}
            {showPagination && pages > 1 && (
                <Html position={[0, 0.72, 0.91]} center distanceFactor={8}>
                    <div
                        className="table-pagination"
                        role="group"
                        aria-label={`${label} display pages`}
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            disabled={current === 0}
                            aria-label={`Previous ${label} products`}
                            onClick={() => setPage(current - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span aria-live="polite" aria-atomic="true">
                            {current + 1} / {pages}
                        </span>
                        <button
                            type="button"
                            disabled={current + 1 >= pages}
                            aria-label={`Next ${label} products`}
                            onClick={() => setPage(current + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </Html>
            )}
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
    officeFrontZ = userRoomEntrance.z,
    sideWallX = 7.35,
    wallThickness = 0.15;
const innerEdgeX = sideWallX - wallThickness / 2;
const roomWidth = innerEdgeX - wallThickness / 2;
const officeCenter = userRoomEntrance.x;
const deskZ = userRoomDeskZ,
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

function GlassDoor({
    side,
    width,
    autoOpen = false,
}: {
    side: number;
    width: number;
    autoOpen?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const hinge = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (hinge.current) {
            hinge.current.rotation.y = THREE.MathUtils.damp(
                hinge.current.rotation.y,
                open || autoOpen ? (-side * Math.PI) / 2 : 0,
                7,
                dt,
            );
        }
    });
    const center = (-side * width) / 2;
    return (
        <group
            ref={hinge}
            name="office-door"
            position={[(side * width) / 2, 0, officeFrontZ]}
            onClick={(event) => {
                event.stopPropagation();
                setOpen((value) => !value);
            }}
        >
            <Glass p={[center, 1.38, 0]} s={[width - 0.07, 2.66, 0.035]} />
            {[0.055, 2.705].map((y) => (
                <Box
                    key={y}
                    p={[center, y, 0]}
                    s={[width - 0.04, 0.045, 0.055]}
                    c="#726879"
                />
            ))}
            {[-1, 1].map((edge) => (
                <Box
                    key={edge}
                    p={[center + edge * (width / 2 - 0.035), 1.38, 0]}
                    s={[0.035, 2.65, 0.055]}
                    c="#726879"
                />
            ))}
            <Box
                p={[-side * (width - 0.15), 1.2, 0.08]}
                s={[0.035, 0.34, 0.055]}
                c="#bcb8c3"
                metal={0.9}
            />
        </group>
    );
}

function Office({
    x,
    label,
    entering = false,
}: {
    x: number;
    label: string;
    entering?: boolean;
}) {
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
            <Box
                p={[0, 2.74, officeFrontZ - 0.025]}
                s={[roomWidth - 0.1, 0.018, 0.055]}
                c="#c998ff"
                glow
            />
            <pointLight
                position={[0, 2.35, rearZ + 0.85]}
                color="#bb81ff"
                intensity={10}
                distance={5.4}
            />
            <Sign
                p={[0, 2.9, officeFrontZ + 0.087]}
                size={0.185}
                alwaysVisible={label === 'USER PANEL'}
            >
                {label}
            </Sign>
            {[-1, 1].map((side) => {
                const panelX = (side * (entranceWidth + glassWidth)) / 2;
                return (
                    <group key={side}>
                        <Box
                            p={[panelX, 0.068, officeFrontZ + 0.021]}
                            s={[glassWidth - 0.06, 0.015, 0.026]}
                            c="#9752d8"
                            glow
                        />
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
            <GlassDoor
                side={doorSide}
                width={entranceWidth}
                autoOpen={entering}
            />
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
                <pointLight
                    position={[0, 1.58, 0.05]}
                    color="#ffc291"
                    intensity={1.3}
                    distance={1.85}
                />
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
    destination,
    onArrive,
    onTableReach,
    view,
    tables,
    onPick,
    quality,
    robotEnabled,
    onUserRoomEnter,
    panelEntering,
    panelSeated,
    onPanelSeated,
}: {
    destination: RobotDestination | null;
    onArrive: (reached: boolean) => void;
    onTableReach: (index: number) => void;
    view: string;
    tables: ShowroomTable[];
    onPick: (product: ShowroomProduct) => void;
    quality: boolean;
    robotEnabled: boolean;
    panelEntering: boolean;
    panelSeated: boolean;
    onPanelSeated?: () => void;
    onUserRoomEnter?: () => void;
}) {
    const { camera: responsiveCamera, size, scene } = useThree();
    useEffect(() => {
        if (responsiveCamera instanceof THREE.PerspectiveCamera) {
            responsiveCamera.fov = size.width < size.height ? 75 : 43;
            responsiveCamera.updateProjectionMatrix();
        }
    }, [responsiveCamera, size.width, size.height]);
    const [nearbyTable, setNearbyTable] = useState<number | null>(null);
    const controls = useRef<any>(null);
    const target = useRef<V>([0, 0, 0]);
    const dest = useRef<V>([12, 10, 15]);
    useEffect(() => {
        const map: Record<string, [V, V]> = {
            overview: [
                [12, 10, 15],
                [0, 0, -1],
            ],
            ...Object.fromEntries(
                tableViews.map((name, index) => {
                    const [x, z] = tablePositions[index];
                    return [
                        name,
                        [
                            [x, 4, z + 6],
                            [x, 1, z],
                        ] as [V, V],
                    ];
                }),
            ),
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
    const actor = useRef<THREE.Object3D | null>(null);
    useEffect(() => {
        moving.current = !panelEntering;
    }, [panelEntering]);
    const moving = useRef(true);
    useEffect(() => {
        if (destination) moving.current = false;
    }, [destination]);
    const waypoint = React.useMemo(() => new THREE.Vector3(), []);
    useFrame(({ camera }, dt) => {
        if (panelEntering && controls.current) {
            actor.current ??= scene.getObjectByName('controlled-robot') ?? null;
            camera.position.lerp(
                panelSeated
                    ? waypoint.set(officeCenter + 0.15, 1.65, deskZ + 0.9)
                    : waypoint.set(6.4, 3.15, -0.8),
                1 - Math.exp(-dt * (panelSeated ? 3.5 : 2.5)),
            );
            const robot = actor.current;
            controls.current.target.lerp(
                waypoint.set(
                    robot?.position.x ?? officeCenter,
                    panelSeated ? 1.05 : 0.95,
                    robot?.position.z ?? deskZ,
                ),
                1 - Math.exp(-dt * 4),
            );
            controls.current.update();
            return;
        }
        if (destination && controls.current) {
            actor.current ??= scene.getObjectByName('controlled-robot') ?? null;
            const robot = actor.current;
            if (robot) {
                waypoint
                    .set(0, 2.6, -4.2)
                    .applyQuaternion(robot.quaternion)
                    .add(robot.position);
                camera.position.lerp(waypoint, 1 - Math.exp(-dt * 4));
                controls.current.target.lerp(
                    waypoint.set(robot.position.x, 1.1, robot.position.z),
                    1 - Math.exp(-dt * 6),
                );
                controls.current.update();
            }
            return;
        }
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
            <Office
                x={officeCenter}
                label="USER PANEL"
                entering={panelEntering}
            />
            {tablePositions.map(([x, z], i) => (
                <Table
                    key={tables[i]?.slot ?? i}
                    p={[x, 0, z]}
                    kind={i}
                    label={
                        tables[i]?.category?.title ??
                        ['Phone', 'Laptop', 'Gaming', 'Accessories'][i]
                    }
                    products={tables[i]?.products ?? []}
                    showPagination={
                        nearbyTable === i && !destination && !panelEntering
                    }
                    onPick={onPick}
                />
            ))}
            <Suspense fallback={null}>
                <RobotController
                    destination={destination}
                    onArrive={onArrive}
                    onTableReach={onTableReach}
                    onTableProximityChange={setNearbyTable}
                    enabled={robotEnabled}
                    onUserRoomEnter={onUserRoomEnter}
                    panelEntering={panelEntering}
                    onPanelSeated={onPanelSeated}
                />
            </Suspense>
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
                enabled={!panelEntering && !destination}
                enableDamping
                enablePan
                screenSpacePanning
                mouseButtons={{
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.PAN,
                }}
                minDistance={2.5}
                maxDistance={22.4}
                minPolarAngle={0.25}
                maxPolarAngle={Math.PI / 2 - 0.08}
                onStart={() => (moving.current = false)}
            />
            {quality && (
                <EffectComposer multisampling={4}>
                    <N8AO
                        halfRes={false}
                        quality="high"
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
export default function ThreeDSite({
    tables = [],
    onUserRoomEnter,
    robotEnabled = true,
    panelEntering = false,
    panelSeated = false,
    onPanelSeated,
}: {
    tables?: ShowroomTable[];
    onUserRoomEnter?: () => void;
    robotEnabled?: boolean;
    panelEntering?: boolean;
    panelSeated?: boolean;
    onPanelSeated?: () => void;
}) {
    const [interfaceVisible, setInterfaceVisible] = useState(false);
    const [quality, setQuality] = useState(true);
    const [view, setView] = useState('overview');
    const [destination, setDestination] = useState<RobotDestination | null>(
        null,
    );
    const [activeTable, setActiveTable] = useState<number | null>(null);
    const navigationId = useRef(0);
    function navigate(next: string) {
        setView(next);
        setSelected(null);
        setActiveTable(null);
        const index = tableViews.indexOf(next);
        const positions: Record<string, [number, number, number]> = {
            overview: [0, 2.5, Math.PI],
            management: [-userRoomEntrance.x, -2.1, Math.PI],
            user: [userRoomEntrance.x, -2.1, Math.PI],
            lounge: [3.8, 3.95, Math.PI / 2],
        };
        const [x, z, yaw] =
            index >= 0
                ? [
                      tablePositions[index][0],
                      tablePositions[index][1] + 1.4,
                      Math.PI,
                  ]
                : positions[next];
        setDestination({ id: ++navigationId.current, x, z, yaw });
    }
    const [selected, setSelected] = useState<ShowroomProduct | null>(null);
    return (
        <InterfaceVisible.Provider value={interfaceVisible}>
            <main
                className={[
                    'imported-showroom',
                    !interfaceVisible && 'interface-hidden',
                    panelEntering && 'panel-entering',
                ]
                    .filter(Boolean)
                    .join(' ')}
                aria-busy={panelEntering}
                dir="ltr"
            >
                <button
                    type="button"
                    className="interface-toggle"
                    aria-label={
                        interfaceVisible ? 'Hide controls' : 'Show controls'
                    }
                    title={interfaceVisible ? 'Hide controls' : 'Show controls'}
                    aria-pressed={interfaceVisible}
                    onClick={() => {
                        setInterfaceVisible((value) => !value);
                        setSelected(null);
                    }}
                >
                    {interfaceVisible ? (
                        <EyeOff size={20} aria-hidden="true" />
                    ) : (
                        <Eye size={20} aria-hidden="true" />
                    )}
                </button>
                <header>
                    <button
                        onClick={() => setQuality(!quality)}
                        aria-pressed={quality}
                        title={
                            quality
                                ? 'Switch to performance mode'
                                : 'Switch to high quality'
                        }
                    >
                        {quality ? 'HIGH QUALITY' : 'PERFORMANCE'}
                    </button>
                </header>
                <section className="viewport">
                    <Canvas
                        shadows
                        dpr={quality ? 2 : 1}
                        camera={{ position: [12, 10, 15], fov: 43 }}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                        }}
                    >
                        <Suspense fallback={null}>
                            <Scene
                                destination={destination}
                                onArrive={(reached) => {
                                    setDestination(null);
                                    if (!reached) return;
                                    const index = tableViews.indexOf(view);
                                    if (index >= 0) setActiveTable(index);
                                    if (view === 'user') onUserRoomEnter?.();
                                }}
                                onTableReach={setActiveTable}
                                view={view}
                                tables={tables}
                                quality={quality}
                                robotEnabled={
                                    robotEnabled && activeTable === null
                                }
                                panelEntering={panelEntering}
                                panelSeated={panelSeated}
                                onPanelSeated={onPanelSeated}
                                onUserRoomEnter={onUserRoomEnter}
                                onPick={setSelected}
                            />
                        </Suspense>
                    </Canvas>
                    {selected && (
                        <aside
                            className="product-details"
                            aria-label="Selected product"
                        >
                            <button
                                type="button"
                                aria-label="Close product details"
                                onClick={() => setSelected(null)}
                            >
                                <X size={16} />
                            </button>
                            <h3 dir="auto">{selected.title}</h3>
                            <p>
                                {selected.price > 0
                                    ? selected.price.toLocaleString()
                                    : 'Price not set'}
                            </p>
                            <p>
                                {selected.stock > 0
                                    ? `${selected.stock} in stock`
                                    : 'Out of stock'}
                            </p>
                            <Link
                                href={showProduct(selected.id)}
                                className="product-detail-link"
                            >
                                View product
                            </Link>
                        </aside>
                    )}
                </section>
                <nav>
                    {Object.entries({
                        overview: 'Overview',
                        phones: tables[0]?.category?.title ?? 'Phone',
                        laptops: tables[1]?.category?.title ?? 'Laptop',
                        gaming: tables[2]?.category?.title ?? 'Gaming',
                        accessories:
                            tables[3]?.category?.title ?? 'Accessories',
                        management: 'Management',
                        user: 'User panel',
                        lounge: 'Lounge',
                    }).map(([k, v]) => (
                        <button
                            className={view === k ? 'active' : ''}
                            key={k}
                            disabled={panelEntering}
                            onClick={() => navigate(k)}
                        >
                            {v}
                        </button>
                    ))}
                </nav>
                {activeTable !== null && (
                    <CategoryModal
                        table={tables[activeTable]}
                        onClose={() => setActiveTable(null)}
                    />
                )}
                <footer>
                    <details className="asset-credits">
                        <summary
                            aria-label="3D asset credits"
                            title="3D asset credits"
                        >
                            <Info size={18} aria-hidden="true" />
                        </summary>
                        <p>
                            3D assets by{' '}
                            <a
                                href="https://vinish.dev/free-3d-models/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                vinish.dev
                            </a>
                            ,{' '}
                            <a
                                href="https://creativecommons.org/licenses/by/4.0/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                CC BY 4.0
                            </a>
                            . Robot: Unitree Robotics, BSD-3-Clause.
                        </p>
                    </details>
                </footer>
            </main>
        </InterfaceVisible.Provider>
    );
}

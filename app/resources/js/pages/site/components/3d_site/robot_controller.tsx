import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { tableCenters, tableZ } from './surfaces';

const controlKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyQ',
    'KeyE',
    'Space',
]);
const robotRadius = 0.32;
const up = new THREE.Vector3(0, 1, 0);
const jointAxis = new THREE.Vector3(0, 1, 0);
const obstacles = [
    ...tableCenters.map((x) => ({ x, z: tableZ, halfX: 1.9, halfZ: 0.84 })),
    ...[-1, 1].flatMap((side) => [
        { x: side * 6.38, z: 3.95, halfX: 0.55, halfZ: 1.5 },
        { x: side * 4.98, z: 3.95, halfX: 0.36, halfZ: 0.915 },
    ]),
];

function canStandAt(x: number, z: number) {
    if (
        Math.abs(x) > 7.275 - robotRadius ||
        z < -2.82 + robotRadius ||
        z > 6.39 - robotRadius
    ) {
        return false;
    }
    return obstacles.every((obstacle) => {
        const dx = Math.max(0, Math.abs(x - obstacle.x) - obstacle.halfX);
        const dz = Math.max(0, Math.abs(z - obstacle.z) - obstacle.halfZ);
        return dx * dx + dz * dz >= robotRadius * robotRadius;
    });
}

export default function RobotController() {
    const { scene } = useGLTF('/models/showroom/unitree-g1.glb?v=d8bb71869611');
    const root = useRef<THREE.Group>(null);
    const pressed = useRef(new Set<string>());
    const phase = useRef(0);
    const walking = useRef(0);
    const running = useRef(0);
    const rig = useMemo(() => {
        const model = scene.clone(true);
        const chestLogo = model.getObjectByName('logo_link');
        if (chestLogo) chestLogo.visible = false;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model, true);
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 1.6 / bounds.getSize(new THREE.Vector3()).y;
        model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
        const body = new THREE.Group();
        body.add(model);
        body.scale.setScalar(scale);
        model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.geometry.computeBoundingBox();
            }
        });
        const names = [
            'left_hip_pitch_link',
            'right_hip_pitch_link',
            'left_knee_link',
            'right_knee_link',
            'left_ankle_pitch_link',
            'right_ankle_pitch_link',
            'left_shoulder_pitch_link',
            'right_shoulder_pitch_link',
            'left_elbow_link',
            'right_elbow_link',
        ];
        const joints = names.map((name) => {
            const joint = model.getObjectByName(name);
            if (!joint) throw new Error(`Missing robot joint: ${name}`);
            return { joint, rest: joint.quaternion.clone() };
        });
        const feet = [
            'left_ankle_roll_link_visual',
            'right_ankle_roll_link_visual',
        ]
            .map((name) => model.getObjectByName(name))
            .filter(
                (object): object is THREE.Mesh => object instanceof THREE.Mesh,
            );
        const torso = model.getObjectByName('torso_link');
        return {
            torso,
            torsoRest: torso?.quaternion.clone(),
            body,
            joints,
            feet,
            forward: new THREE.Vector3(),
            right: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            jointRotation: new THREE.Quaternion(),
            footBounds: new THREE.Box3(),
        };
    }, [scene]);

    useEffect(() => {
        const keys = pressed.current;
        const clear = () => keys.clear();
        const keydown = (event: KeyboardEvent) => {
            const target = event.target;
            if (
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                (target instanceof HTMLElement &&
                    target.closest(
                        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
                    ))
            ) {
                clear();
                return;
            }
            if (controlKeys.has(event.code)) {
                event.preventDefault();
                keys.add(event.code);
            }
        };
        const keyup = (event: KeyboardEvent) => {
            keys.delete(event.code);
        };
        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);
        window.addEventListener('blur', clear);
        document.addEventListener('visibilitychange', clear);
        document.addEventListener('focusin', clear);
        return () => {
            clear();
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('keyup', keyup);
            window.removeEventListener('blur', clear);
            document.removeEventListener('visibilitychange', clear);
            document.removeEventListener('focusin', clear);
        };
    }, []);

    useFrame((_, elapsed) => {
        const robot = root.current;
        if (!robot) return;
        const dt = Math.min(elapsed, 0.05);
        const keys = pressed.current;
        const vertical =
            Number(keys.has('ArrowUp') || keys.has('KeyW')) -
            Number(keys.has('ArrowDown') || keys.has('KeyS'));
        const horizontal =
            Number(keys.has('ArrowRight') || keys.has('KeyD')) -
            Number(keys.has('ArrowLeft') || keys.has('KeyA'));
        const rotation = Number(keys.has('KeyQ')) - Number(keys.has('KeyE'));
        robot.rotation.y += rotation * Math.PI * 0.75 * dt;
        rig.forward.set(0, 0, 1).applyQuaternion(robot.quaternion);
        rig.right.crossVectors(rig.forward, up).normalize();
        rig.direction
            .copy(rig.forward)
            .multiplyScalar(vertical)
            .addScaledVector(rig.right, horizontal);
        if (rig.direction.lengthSq() > 0) rig.direction.normalize();

        const oldX = robot.position.x,
            oldZ = robot.position.z;
        const sprinting = keys.has('Space');
        const step = 1.45 * (sprinting ? 2 : 1) * dt;
        const nextX = oldX + rig.direction.x * step;
        if (canStandAt(nextX, oldZ)) robot.position.x = nextX;
        const nextZ = oldZ + rig.direction.z * step;
        if (canStandAt(robot.position.x, nextZ)) robot.position.z = nextZ;
        const dx = robot.position.x - oldX,
            dz = robot.position.z - oldZ;
        const distance = Math.hypot(dx, dz);
        const isMoving = distance > 0.00001;
        walking.current = THREE.MathUtils.damp(
            walking.current,
            isMoving ? 1 : 0,
            12,
            dt,
        );
        running.current = THREE.MathUtils.damp(
            running.current,
            isMoving && sprinting ? 1 : 0,
            10,
            dt,
        );
        const run = running.current;
        if (isMoving) {
            phase.current =
                (phase.current + (distance * Math.PI * 2) / (1 + run * 0.3)) %
                (Math.PI * 2);
        }
        const swing = Math.sin(phase.current);
        const weight = walking.current;
        const hipSwing = 0.38 + run * 0.24;
        const kneeLift = 0.65 + run * 0.4;
        const armSwing = 0.3 + run * 0.25;
        const leftHip = -swing * hipSwing * weight;
        const rightHip = swing * hipSwing * weight;
        const leftKnee = Math.max(0, swing) * kneeLift * weight;
        const rightKnee = Math.max(0, -swing) * kneeLift * weight;
        const angles = [
            leftHip,
            rightHip,
            leftKnee,
            rightKnee,
            -leftHip - leftKnee,
            -rightHip - rightKnee,
            swing * armSwing * weight,
            -swing * armSwing * weight,
            (Math.max(0, -swing) * 0.12 + run * 0.45) * weight,
            (Math.max(0, swing) * 0.12 + run * 0.45) * weight,
        ];
        rig.joints.forEach(({ joint, rest }, index) => {
            rig.jointRotation.setFromAxisAngle(jointAxis, angles[index]);
            joint.quaternion.copy(rest).multiply(rig.jointRotation);
        });
        if (rig.torso && rig.torsoRest) {
            rig.jointRotation.setFromAxisAngle(jointAxis, run * 0.14);
            rig.torso.quaternion
                .copy(rig.torsoRest)
                .multiply(rig.jointRotation);
        }
        // Keep the lowest foot on the floor as the articulated legs bend.
        robot.position.y = 0;
        robot.updateMatrixWorld(true);
        let floor = Infinity;
        for (const foot of rig.feet) {
            if (foot.geometry.boundingBox) {
                rig.footBounds
                    .copy(foot.geometry.boundingBox)
                    .applyMatrix4(foot.matrixWorld);
                floor = Math.min(floor, rig.footBounds.min.y);
            }
        }
        if (Number.isFinite(floor)) {
            robot.position.y =
                0.006 -
                floor +
                run * Math.abs(Math.sin(phase.current * 2)) * 0.025;
        }
    });

    return (
        <group ref={root} name="controlled-robot" position={[0, 0, 2.5]}>
            <primitive object={rig.body} dispose={null} />
        </group>
    );
}

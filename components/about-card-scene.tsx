'use client';

/* oxlint-disable react/react-compiler -- R3F owns these mutable Three.js objects; camera/environment updates belong in effects. */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function roundedPath<T extends THREE.Path>(path: T, width: number, height: number, radius: number, cx = 0, cy = 0): T {
  const x = cx - width / 2;
  const y = cy - height / 2;
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

function holderShape(window: boolean) {
  const shape = roundedPath(new THREE.Shape(), 9.03, 6.62, 0.48);
  shape.holes.push(roundedPath(new THREE.Path(), 2.10, 0.28, 0.14, 0.135, 2.95));
  if (window) shape.holes.push(roundedPath(new THREE.Path(), 8.48, 5.70, 0.32, 0.015, -0.19));
  return shape;
}

function extrude(shape: THREE.Shape, depth: number, bevel: number) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, steps: 1, curveSegments: 24 });
}

function CardModel({ card, onReady }: { card: HTMLCanvasElement; onReady: () => void }) {
  const group = useRef<THREE.Group>(null);
  const readyFrame = useRef(0);
  const reportedReady = useRef(false);
  const { gl, scene, camera, size, invalidate } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const reduced = useRef(false);
  const texture = useMemo(() => {
    const map = new THREE.CanvasTexture(card);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
    return map;
  }, [card, gl]);
  const geometry = useMemo(() => {
    const seam = roundedPath(new THREE.Shape(), 8.49, 5.71, 0.33);
    seam.holes.push(roundedPath(new THREE.Path(), 8.43, 5.65, 0.30));
    const face = new THREE.ShapeGeometry(roundedPath(new THREE.Shape(), 8.18, 5.42, 0.24), 24);
    const uv = face.getAttribute('uv');
    const position = face.getAttribute('position');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) / 8.18 + 0.5, position.getY(i) / 5.42 + 0.5);
    return {
      rim: extrude(holderShape(true), 0.20, 0.03),
      back: extrude(holderShape(false), 0.035, 0.02),
      card: extrude(roundedPath(new THREE.Shape(), 8.18, 5.42, 0.24), 0.035, 0.008),
      film: extrude(roundedPath(new THREE.Shape(), 8.48, 5.70, 0.32), 0.012, 0.01),
      face,
      seam: extrude(seam, 0.015, 0.008),
    };
  }, []);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose(); generator.dispose();
    invalidate();
    return () => { scene.environment = null; environment.dispose(); };
  }, [gl, scene, invalidate]);

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(perspective.fov / 2);
    const aspect = size.width / Math.max(size.height, 1);
    // Fit the same resting composition while preserving actual depth projection.
    perspective.position.z = Math.max(7.9 / 2, 10.25 / (2 * aspect)) / Math.tan(halfFov);
    perspective.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduced.current = motion.matches;
      target.current = { x: 0, y: 0 };
      if (motion.matches && group.current) {
        group.current.rotation.set(0, 0, 0);
        velocity.current = { x: 0, y: 0 };
      }
      invalidate();
    };
    const reset = () => { target.current = { x: 0, y: 0 }; invalidate(); };
    const move = (event: PointerEvent) => {
      if (reduced.current || event.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      const x = THREE.MathUtils.clamp((event.clientX - rect.left - rect.width / 2) / (rect.width * 0.44), -1, 1);
      const y = THREE.MathUtils.clamp((event.clientY - rect.top - rect.height / 2) / (rect.height * 0.42), -1, 1);
      target.current = {
        x: y * THREE.MathUtils.degToRad(10),
        y: x * THREE.MathUtils.degToRad(12),
      };
      invalidate();
    };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', reset);
    motion.addEventListener('change', sync);
    sync();
    return () => { canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', reset); motion.removeEventListener('change', sync); };
  }, [gl, invalidate]);

  // A damped spring runs only while settling. No continuous render loop at rest.
  useFrame((_, delta) => {
    if (!group.current || reduced.current) return;
    const steps = Math.max(1, Math.ceil(Math.min(delta, 0.05) / (1 / 120)));
    const dt = Math.min(delta, 0.05) / steps;
    for (let i = 0; i < steps; i++) {
      for (const axis of ['x', 'y'] as const) {
        const displacement = target.current[axis] - group.current.rotation[axis];
        velocity.current[axis] += (displacement * 95 - velocity.current[axis] * 20) * dt;
        group.current.rotation[axis] += velocity.current[axis] * dt;
      }
    }
    if (Math.abs(velocity.current.x) + Math.abs(velocity.current.y)
      + Math.abs(target.current.x - group.current.rotation.x) + Math.abs(target.current.y - group.current.rotation.y) > 0.0001) invalidate();
  });

  const reportRendered = () => {
    if (reportedReady.current) return;
    reportedReady.current = true;
    readyFrame.current = requestAnimationFrame(onReady);
  };
  useEffect(() => () => cancelAnimationFrame(readyFrame.current), []);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => () => Object.values(geometry).forEach((item) => item.dispose()), [geometry]);

  return <group ref={group}>
    <mesh geometry={geometry.back} position={[0, 0, -0.12]} castShadow receiveShadow onAfterRender={reportRendered}>
      <meshPhysicalMaterial color="#e7e6de" roughness={0.38} clearcoat={0.6} />
    </mesh>
    <mesh geometry={geometry.rim} position={[0, 0, -0.08]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#f5f4ed" roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} transmission={0.06} thickness={0.20} ior={1.46} />
    </mesh>
    <group position={[0.015, -0.19, -0.035]}>
      <mesh geometry={geometry.card} castShadow><meshStandardMaterial color="#f6f4ec" roughness={0.6} /></mesh>
      <mesh geometry={geometry.face} position={[0, 0, 0.045]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
    <mesh geometry={geometry.film} position={[0.015, -0.19, 0.09]}>
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.065} depthWrite={false} roughness={0.12} ior={1.46} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={0.55} />
    </mesh>
    <mesh geometry={geometry.seam} position={[0.015, -0.19, 0.08]}>
      <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} />
    </mesh>
  </group>;
}

export default function AboutCardScene({ card, onReady, onFailure }: { card: HTMLCanvasElement; onReady: () => void; onFailure: () => void }) {
  return <Canvas camera={{ position: [0, 0, 15], fov: 35, near: 0.1, far: 60 }}
    frameloop="demand" dpr={[1, 2]} shadows="percentage" gl={{ alpha: true, antialias: true }}
    onCreated={({ gl }) => { gl.transmissionResolutionScale = 1; gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}
    fallback={<span>3D unavailable. The flat card remains visible.</span>}>
    <ambientLight intensity={0.6} />
    <spotLight position={[-4, 7, 9]} intensity={45} angle={0.65} penumbra={1} castShadow shadow-mapSize={[512, 512]} shadow-radius={4} shadow-bias={-0.0003} />
    <directionalLight position={[5, -2, 6]} intensity={1} />
    <CardModel card={card} onReady={onReady} />
    <mesh position={[0, 0, -0.55]} receiveShadow>
      <planeGeometry args={[30, 30]} /><shadowMaterial transparent opacity={0.32} />
    </mesh>
  </Canvas>;
}

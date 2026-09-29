import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const TURNS = 4;
const POINTS_PER_TURN = 16;
const RADIUS = 1.15;
const HEIGHT = 6.4;
const TOTAL = TURNS * POINTS_PER_TURN;

function helixPos(i: number, strand: 0 | 1) {
  const t = i / TOTAL;
  const angle = t * Math.PI * 2 * TURNS + (strand === 1 ? Math.PI : 0);
  return new THREE.Vector3(
    Math.cos(angle) * RADIUS,
    (t - 0.5) * HEIGHT,
    Math.sin(angle) * RADIUS,
  );
}

function Helix({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    // gentle parallax tilt toward pointer
    const targetX = pointer.current.y * 0.25;
    const targetZ = pointer.current.x * 0.15;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (targetZ - group.current.rotation.z) * 0.04;
    // subtle breathing
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
    group.current.scale.setScalar(s);
  });

  const teal = new THREE.Color("#22d3ee");
  const tealDeep = new THREE.Color("#0F4C5C");
  const chrome = new THREE.Color("#e8ecf1");

  const nodes: { pos: THREE.Vector3; strand: 0 | 1 }[] = [];
  for (let i = 0; i <= TOTAL; i++) {
    nodes.push({ pos: helixPos(i, 0), strand: 0 });
    nodes.push({ pos: helixPos(i, 1), strand: 1 });
  }

  // strand tubes
  const strand0Curve = new THREE.CatmullRomCurve3(
    Array.from({ length: TOTAL + 1 }, (_, i) => helixPos(i, 0)),
  );
  const strand1Curve = new THREE.CatmullRomCurve3(
    Array.from({ length: TOTAL + 1 }, (_, i) => helixPos(i, 1)),
  );

  return (
    <group ref={group}>
      {/* Strands */}
      <mesh>
        <tubeGeometry args={[strand0Curve, 400, 0.075, 16, false]} />
        <meshPhysicalMaterial
          color={chrome}
          metalness={1}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.3}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[strand1Curve, 400, 0.075, 16, false]} />
        <meshPhysicalMaterial
          color={chrome}
          metalness={1}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.3}
        />
      </mesh>

      {/* Rungs (base pairs) */}
      {Array.from({ length: TOTAL + 1 }).map((_, i) => {
        if (i % 2 !== 0) return null;
        const a = helixPos(i, 0);
        const b = helixPos(i, 1);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize(),
        );
        return (
          <mesh key={`r-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.035, 0.035, len, 12]} />
            <meshStandardMaterial
              color={teal}
              emissive={teal}
              emissiveIntensity={1.6}
              metalness={0.4}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Nucleotide spheres */}
      {nodes.map((n, i) => (
        <mesh key={`n-${i}`} position={n.pos}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshPhysicalMaterial
            color={n.strand === 0 ? teal : tealDeep}
            emissive={n.strand === 0 ? teal : tealDeep}
            emissiveIntensity={n.strand === 0 ? 0.9 : 0.35}
            metalness={0.7}
            roughness={0.15}
            clearcoat={1}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DnaHelix3D({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
      {/* Soft bloom backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.35) 0%, rgba(15,76,92,0.15) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {mounted && (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          resize={{ debounce: 0 }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent" }}
          onCreated={({ camera, size }) => {
            const c = camera as THREE.PerspectiveCamera;
            c.fov = size.width < 640 ? 58 : size.width < 1024 ? 50 : 42;
            c.updateProjectionMatrix();
          }}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-4, 2, -3]} intensity={2.2} color="#22d3ee" />
          <pointLight position={[3, -3, 2]} intensity={1.5} color="#127481" />
          <Suspense fallback={null}>
            <Environment preset="city" />
            <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.6}>
              <Helix pointer={pointer} />
            </Float>
            <Sparkles
              count={120}
              scale={[7, 9, 7]}
              size={3}
              speed={0.4}
              color="#7be7ff"
              opacity={0.9}
            />
            <EffectComposer multisampling={4}>
              <Bloom
                intensity={1.1}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={0.85}
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.0008, 0.0012] as unknown as THREE.Vector2}
              />
              <Vignette eskil={false} offset={0.15} darkness={0.6} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// ─── 3D Components ────────────────────────────────────────────────────────────

function RiceGrain({
  position, scale, rotationSpeed, color,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotationSpeed: [number, number, number];
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += rotationSpeed[0] * delta;
    ref.current.rotation.y += rotationSpeed[1] * delta;
    ref.current.rotation.z += rotationSpeed[2] * delta;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <capsuleGeometry args={[0.08, 0.25, 6, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

function Sack({
  position, rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <capsuleGeometry args={[0.28, 0.5, 8, 12]} />
      <meshStandardMaterial color="#b45309" roughness={0.9} />
    </mesh>
  );
}

function TippedTruck() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    // subtle wobble
    group.current.rotation.z = -0.55 + Math.sin(clock.elapsedTime * 0.6) * 0.02;
  });

  return (
    <group ref={group} position={[-1.2, -1.1, 0]} rotation={[0, 0.3, -0.55]}>
      {/* Main cargo box */}
      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[2.4, 1.1, 1.2]} />
        <meshStandardMaterial color="#15803d" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Cab */}
      <mesh position={[-0.95, 0.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 1.2]} />
        <meshStandardMaterial color="#166534" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-1.28, 0.25, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.05, 0.5, 0.9]} />
        <meshStandardMaterial color="#bfdbfe" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      {[[-0.3, -0.55, 0.7], [-0.3, -0.55, -0.7], [1.2, -0.55, 0.7], [1.2, -0.55, -0.7]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.18, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
      {/* Wheel hubs */}
      {[[-0.3, -0.55, 0.7], [-0.3, -0.55, -0.7], [1.2, -0.55, 0.7], [1.2, -0.55, -0.7]].map(([x, y, z], i) => (
        <mesh key={`hub-${i}`} position={[x, y, z + (z > 0 ? 0.1 : -0.1)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Exhaust puff */}
      <mesh position={[-1.4, 0.6, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#d1d5db" transparent opacity={0.4} />
      </mesh>
      {/* Al-Noor logo panel */}
      <mesh position={[0.5, 0.35, 0.61]}>
        <boxGeometry args={[1.6, 0.28, 0.01]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.5} />
      </mesh>
    </group>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#d1fae5" roughness={1} metalness={0} />
    </mesh>
  );
}

function Scene() {
  const grains = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3 - 0.5,
      ] as [number, number, number],
      scale: [
        0.6 + Math.random() * 0.8,
        0.6 + Math.random() * 0.8,
        0.6 + Math.random() * 0.8,
      ] as [number, number, number],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.3,
      ] as [number, number, number],
      color: ['#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#fffbeb'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  const sacks = useMemo(() => [
    { position: [1.8, -1.4, 0.3] as [number, number, number], rotation: [0.2, 0.3, 0.8] as [number, number, number] },
    { position: [2.6, -1.5, -0.2] as [number, number, number], rotation: [0.1, -0.4, -0.5] as [number, number, number] },
    { position: [2.0, -0.9, -0.5] as [number, number, number], rotation: [0.5, 0.1, 1.1] as [number, number, number] },
    { position: [3.2, -1.3, 0.4] as [number, number, number], rotation: [-0.2, 0.6, 0.3] as [number, number, number] },
  ], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-4, 3, -2]} intensity={0.6} color="#fbbf24" />
      <pointLight position={[3, -1, 3]} intensity={0.3} color="#86efac" />

      <Environment preset="sunset" />

      {/* Ground */}
      <GroundPlane />

      {/* Truck */}
      <TippedTruck />

      {/* Rice sacks */}
      {sacks.map((s, i) => (
        <Float key={i} speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
          <Sack position={s.position} rotation={s.rotation} />
        </Float>
      ))}

      {/* Flying rice grains */}
      {grains.map(g => (
        <Float key={g.id} speed={0.8 + Math.random()} rotationIntensity={0.3} floatIntensity={0.5}>
          <RiceGrain {...g} />
        </Float>
      ))}

      {/* Sparkle particles */}
      <Sparkles
        count={60}
        scale={[10, 6, 4]}
        size={1.5}
        speed={0.3}
        opacity={0.6}
        color="#fbbf24"
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-800 relative flex flex-col items-center justify-center overflow-hidden">

      {/* 3D Canvas — full background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.5, 7], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Overlay gradient so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-green-950/20 to-green-950/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 select-none">
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-[clamp(96px,22vw,220px)] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fef3c7 70%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(251,191,36,0.4))',
            }}
          >
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Shipment Lost in the Fields
          </h2>
          <p className="text-green-200 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-10">
            Our delivery truck took a wrong turn and spilled the rice. The page you're looking for isn't here — but our mill is still running!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-green-900 text-base font-bold rounded-2xl transition-colors shadow-lg shadow-amber-400/20"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Home size={18} />
              Go to Store
            </motion.button>
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-base font-bold rounded-2xl border border-white/20 transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft size={18} />
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Al-Noor branding watermark */}
      <motion.p
        className="absolute bottom-6 text-green-400/50 text-sm font-medium z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        🌾 Al-Noor Rice Mills · Batkhela, KPK
      </motion.p>
    </div>
  );
}

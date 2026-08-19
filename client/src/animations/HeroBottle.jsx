import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Float,
  MeshTransmissionMaterial,
  ContactShadows,
  Text,
  RoundedBox,
} from '@react-three/drei';

/**
 * Reference: clear rectangular flask, wider than tall in footprint,
 * beveled vertical edges, short neck, gold collar ring,
 * faceted octagonal "gem-cut" glass cap, golden liquid inside
 * filled to roughly 80% height, gold embossed wordmark on the face.
 */

const BODY_W = 1.7; // width
const BODY_D = 1.15; // depth
const BODY_H = 2.05; // height
const LIQUID_FILL = 0.82; // fraction of body height filled

function GlassBody() {
  return (
    <RoundedBox
      args={[BODY_W, BODY_H, BODY_D]}
      radius={0.05}
      smoothness={4}
      position={[0, BODY_H / 2, 0]}
      castShadow
      receiveShadow
    >
      <MeshTransmissionMaterial
        samples={6}
        thickness={0.4}
        roughness={0.02}
        transmission={1}
        ior={1.5}
        chromaticAberration={0.03}
        anisotropy={0.1}
        distortion={0.03}
        distortionScale={0.15}
        temporalDistortion={0}
        clearcoat={1}
        attenuationColor="#ffffff"
        attenuationDistance={3}
        color="#ffffff"
      />
    </RoundedBox>
  );
}

function Liquid() {
  const liquidH = BODY_H * LIQUID_FILL;
  return (
    <RoundedBox
      args={[BODY_W - 0.14, liquidH, BODY_D - 0.14]}
      radius={0.04}
      smoothness={4}
      position={[0, liquidH / 2 + 0.06, 0]}
      castShadow
    >
      <meshPhysicalMaterial
        color="#e8b84b"
        transmission={0.85}
        thickness={0.5}
        roughness={0.05}
        ior={1.35}
        attenuationColor="#c98a1e"
        attenuationDistance={0.9}
      />
    </RoundedBox>
  );
}

// Faceted "gem cut" octagonal cap, matching the diamond-cut cap in the reference
function FacetedCap({ y }) {
  const sides = 8;
  const rot = Math.PI / sides;

  return (
    <group position={[0, y, 0]}>
      {/* Gold spray nozzle collar under the cap */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.19, 0.22, 0.22, 24]} />
        <meshStandardMaterial color="#cfa54a" metalness={1} roughness={0.15} />
      </mesh>

      {/* Lower cap block (wider octagon) */}
      <mesh position={[0, 0.14, 0]} rotation={[0, rot, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.28, sides]} />
        <MeshTransmissionMaterial
          samples={4}
          thickness={0.5}
          roughness={0.03}
          transmission={1}
          ior={1.55}
          chromaticAberration={0.04}
          clearcoat={1}
          color="#ffffff"
        />
      </mesh>

      {/* Upper cap block (slightly narrower octagon) */}
      <mesh position={[0, 0.34, 0]} rotation={[0, rot, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.14, sides]} />
        <MeshTransmissionMaterial
          samples={4}
          thickness={0.4}
          roughness={0.03}
          transmission={1}
          ior={1.55}
          chromaticAberration={0.04}
          clearcoat={1}
          color="#ffffff"
        />
      </mesh>

      {/* Top facet cap */}
      <mesh position={[0, 0.44, 0]} rotation={[0, rot, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.08, sides]} />
        <MeshTransmissionMaterial
          samples={4}
          thickness={0.3}
          roughness={0.03}
          transmission={1}
          ior={1.55}
          chromaticAberration={0.04}
          clearcoat={1}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

function Bottle() {
  const neckTopY = BODY_H;

  return (
    <group position={[0, -BODY_H / 2 - 0.5, 0]}>
      <GlassBody />
      <Liquid />

      {/* Short glass neck rising from shoulder */}
      <mesh position={[0, neckTopY + 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.26, 24]} />
        <MeshTransmissionMaterial
          samples={4}
          thickness={0.3}
          roughness={0.03}
          transmission={1}
          ior={1.5}
          clearcoat={1}
          color="#ffffff"
        />
      </mesh>

      {/* Gold collar ring where neck meets cap — signature detail from reference */}
      <mesh position={[0, neckTopY + 0.27, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.1, 24]} />
        <meshStandardMaterial color="#d4af5a" metalness={1} roughness={0.12} />
      </mesh>

      <FacetedCap y={neckTopY + 0.55} />

      {/* Gold embossed wordmark on the front face */}
      <Text
        position={[0, BODY_H * 0.42, BODY_D / 2 + 0.005]}
        fontSize={0.16}
        color="#c9a24a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        ZAZA
      </Text>
      <Text
        position={[0, BODY_H * 0.42 - 0.19, BODY_D / 2 + 0.005]}
        fontSize={0.055}
        color="#c9a24a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.25}
      >
        PERFUMES
      </Text>
    </group>
  );
}

function RotatingRig({ children }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function HeroBottle() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return (
      <div className="w-64 h-96">
        <img
          src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80"
          alt="ZAZA Perfume Bottle"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px]" aria-label="3D ZAZA perfume bottle">
      <Canvas
        camera={{ position: [0, 0.2, 6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[4, 5, 4]}
          intensity={1.5}
          color="#fff6e8"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#d8e0ff" />
        <pointLight position={[0, -1, 3]} intensity={0.4} color="#ffcf8a" />

        <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.4}>
          <RotatingRig>
            <Bottle />
          </RotatingRig>
        </Float>

        <ContactShadows
          position={[0, -2.05, 0]}
          opacity={0.5}
          scale={6}
          blur={2.4}
          far={2}
        />

        <Environment preset="apartment" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}
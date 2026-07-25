import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei'
import * as THREE from 'three'

// Floating sphere with distortion — the main focal piece
const FloatingSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
  })
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#2563EB"
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  )
}

// Small orbiting boxes
const OrbitingCube = ({ radius, speed, offset, color }: {
  radius: number; speed: number; offset: number; color: string
}) => {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.y = Math.sin(t * 0.7) * radius * 0.4
    ref.current.position.z = Math.sin(t) * radius
    ref.current.rotation.x += 0.01
    ref.current.rotation.y += 0.015
  })
  return (
    <Box ref={ref} args={[0.2, 0.2, 0.2]}>
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} transparent opacity={0.9} />
    </Box>
  )
}

// Floating torus ring
const FloatingRing = () => {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.2
    ref.current.rotation.z = state.clock.elapsedTime * 0.1
  })
  return (
    <Float speed={1} floatIntensity={0.5}>
      <Torus ref={ref} args={[1.8, 0.05, 16, 100]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.4} metalness={1} roughness={0} />
      </Torus>
    </Float>
  )
}

// Particle field
const Particles = () => {
  const count = 60
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8
  }
  const ref = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.03
    ref.current.rotation.x = state.clock.elapsedTime * 0.01
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#93C5FD" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// Scene content
const Scene = () => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
    <pointLight position={[-3, 3, 3]} intensity={0.8} color="#3B82F6" />
    <pointLight position={[3, -3, -3]} intensity={0.5} color="#8B5CF6" />

    <FloatingSphere />
    <FloatingRing />
    <Particles />

    <OrbitingCube radius={2.2} speed={0.4} offset={0} color="#3B82F6" />
    <OrbitingCube radius={2.5} speed={0.3} offset={2} color="#8B5CF6" />
    <OrbitingCube radius={2} speed={0.5} offset={4} color="#22C55E" />
    <OrbitingCube radius={2.8} speed={0.25} offset={1} color="#F59E0B" />
  </>
)

export const HeroScene3D = () => (
  <div className="w-full h-full" aria-hidden="true">
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  </div>
)

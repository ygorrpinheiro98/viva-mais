import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Trail, Sparkles, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Runner({ position }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        <mesh position={[0, 0.8, 0]}>
          <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} />
        </mesh>
        <mesh position={[-0.3, 1.2, 0]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.3, 0]} rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, 0.3, 0]} rotation={[-0.3, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function Cyclist({ position }) {
  const ref = useRef()
  const wheelRef = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5 + 1) * 0.08
    }
    if (wheelRef.current) {
      wheelRef.current.rotation.x += 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={ref} position={position}>
        <mesh position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
          <meshStandardMaterial color="#00D9FF" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#00D9FF" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, -0.8]}>
          <capsuleGeometry args={[0.04, 0.35, 8, 16]} />
          <meshStandardMaterial color="#00D9FF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.85, 0.15]}>
          <torusGeometry args={[0.25, 0.02, 8, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -1.2]}>
          <capsuleGeometry args={[0.04, 0.4, 8, 16]} />
          <meshStandardMaterial color="#00D9FF" roughness={0.3} />
        </mesh>
        <mesh position={[-0.35, 0.15, 0]} rotation={[1.5, 0, 0.3]}>
          <capsuleGeometry args={[0.04, 0.35, 8, 16]} />
          <meshStandardMaterial color="#00D9FF" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function EnergyRing() {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.2
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <torusGeometry args={[3, 0.02, 16, 100]} />
      <meshStandardMaterial 
        color="#00D9FF" 
        emissive="#00D9FF"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

function Particles() {
  const count = 50
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2
    }
    return positions
  }, [])

  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FF6B35"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color="#0F0F1A"
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
      <spotLight position={[-5, 10, -5]} angle={0.3} penumbra={1} intensity={0.5} color="#FF6B35" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#00D9FF" />
      
      <Runner position={[-1.5, 0, 0]} />
      <Cyclist position={[1.5, 0, 0]} />
      
      <EnergyRing />
      <Particles />
      <Ground />
      
      <Sparkles
        count={30}
        scale={6}
        size={2}
        speed={0.4}
        color="#FF6B35"
      />
      
      <fog attach="fog" args={['#0F0F1A', 5, 15]} />
    </>
  )
}

function Scene3D() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 1, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default Scene3D

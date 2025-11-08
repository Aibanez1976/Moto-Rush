import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function ParticleSystem() {
  const { motorcycle, gameState, powerUps } = useGameStore()

  return (
    <group>
      {/* Dust particles behind motorcycle */}
      <DustParticles motorcycle={motorcycle} gameState={gameState} />

      {/* Spark particles for turbo boost */}
      <SparkParticles motorcycle={motorcycle} gameState={gameState} powerUps={powerUps} />

      {/* Speed lines effect */}
      <SpeedLines motorcycle={motorcycle} gameState={gameState} />

      {/* Collision sparks */}
      <CollisionSparks motorcycle={motorcycle} gameState={gameState} />

      {/* Coin collection particles */}
      <CoinParticles motorcycle={motorcycle} gameState={gameState} />
    </group>
  )
}

function DustParticles({ motorcycle, gameState }: { motorcycle: any, gameState: string }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 50

  const positions = useMemo(() => new Float32Array(particleCount * 3), [])

  useFrame(() => {
    if (gameState === 'playing' && particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 4
        posArray[i * 3 + 1] = Math.random() * 2
        posArray[i * 3 + 2] = motorcycle.position[2] - i * 0.5
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (gameState !== 'playing') return null

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#D2B48C"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function SparkParticles({ motorcycle, gameState, powerUps }: { motorcycle: any, gameState: string, powerUps: any }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 30

  const positions = useMemo(() => new Float32Array(particleCount * 3), [])
  const colors = useMemo(() => new Float32Array(particleCount * 3), [])

  // Initialize colors
  useMemo(() => {
    for (let i = 0; i < particleCount; i++) {
      colors[i * 3] = 0.2
      colors[i * 3 + 1] = 0.8
      colors[i * 3 + 2] = 1.0
    }
  }, [colors])

  useFrame(() => {
    if (gameState === 'playing' && particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array

      if (powerUps.turbo.active) {
        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3] = motorcycle.position[0] + (Math.random() - 0.5) * 0.5
          posArray[i * 3 + 1] = motorcycle.position[1] + Math.random() * 0.5
          posArray[i * 3 + 2] = motorcycle.position[2] - 1 - i * 0.1
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true
        particlesRef.current.visible = true
      } else {
        particlesRef.current.visible = false
      }
    }
  })

  if (gameState !== 'playing') return null

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

function SpeedLines({ motorcycle, gameState }: { motorcycle: any, gameState: string }) {
  const linesRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (gameState === 'playing' && linesRef.current) {
      const speedFactor = Math.min(motorcycle.speed / 30, 1)
      linesRef.current.children.forEach((line) => {
        const material = (line as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = speedFactor * 0.3
      })
    }
  })

  if (gameState !== 'playing') return null

  return (
    <group ref={linesRef}>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[0, 0, -i * 2]}>
          <planeGeometry args={[0.1, 10]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

function CollisionSparks({ motorcycle, gameState }: { motorcycle: any, gameState: string }) {
  const [showSparks, setShowSparks] = React.useState(false)
  const sparksRef = useRef<THREE.Points>(null)
  const particleCount = 15

  const positions = useMemo(() => new Float32Array(particleCount * 3), [])

  React.useEffect(() => {
    const handleCollision = () => {
      setShowSparks(true)
      setTimeout(() => setShowSparks(false), 500)
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.01 && gameState === 'playing') {
        handleCollision()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState])

  useFrame(() => {
    if (showSparks && sparksRef.current) {
      const posArray = sparksRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] = motorcycle.position[0] + (Math.random() - 0.5) * 0.5
        posArray[i * 3 + 1] = motorcycle.position[1] + Math.random() * 0.5
        posArray[i * 3 + 2] = motorcycle.position[2] + (Math.random() - 0.5) * 0.5
      }

      sparksRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (gameState !== 'playing') return null

  return (
    <points ref={sparksRef} visible={showSparks}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#FFA500"
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  )
}

function CoinParticles({ motorcycle, gameState }: { motorcycle: any, gameState: string }) {
  const [showCoins, setShowCoins] = React.useState(false)
  const coinsRef = useRef<THREE.Group>(null)

  React.useEffect(() => {
    const handleCoinCollection = () => {
      setShowCoins(true)
      setTimeout(() => setShowCoins(false), 1000)
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.005 && gameState === 'playing') {
        handleCoinCollection()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState])

  useFrame((state) => {
    if (showCoins && coinsRef.current) {
      coinsRef.current.children.forEach((coin, index) => {
        coin.position.y = Math.sin(state.clock.elapsedTime * 3 + index) * 0.5
        coin.rotation.y += 0.1
      })
    }
  })

  if (gameState !== 'playing') return null

  return (
    <group ref={coinsRef} visible={showCoins}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[motorcycle.position[0] + (i - 2) * 0.5, motorcycle.position[1] + 1, motorcycle.position[2]]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}
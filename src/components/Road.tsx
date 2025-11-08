import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function Road() {
  const { gameData } = useGame()
  const roadRef = useRef<THREE.Group>(null)
  const roadOffsetRef = useRef(0)

  useFrame((_, delta) => {
    if (roadRef.current && gameData.gameState === 'playing') {
      // Create scrolling road effect by moving road backward relative to motorcycle speed
      const scrollSpeed = gameData.motorcycle.speed * 0.1 // Adjust scroll speed
      roadOffsetRef.current += scrollSpeed * delta

      // Reset offset when it gets too large to prevent floating point issues
      if (roadOffsetRef.current > 10) {
        roadOffsetRef.current = 0
      }

      // Apply the scrolling offset to create movement illusion
      roadRef.current.position.z = roadOffsetRef.current
    }
  })

  return (
    <group ref={roadRef}>
      {/* Main road surface - extended length for scrolling effect */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 200]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Lane dividers - extended length */}
      {[-2.67, 2.67].map((laneX, index) => (
        <mesh key={index} position={[laneX, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.01, 200]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#333333"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Center line - extended length */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.01, 200]} />
        <meshStandardMaterial
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Road edges - extended length */}
      <mesh position={[-4, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.01, 200]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      <mesh position={[4, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.01, 200]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Shoulders - extended length */}
      <mesh position={[-6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 200]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 200]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}
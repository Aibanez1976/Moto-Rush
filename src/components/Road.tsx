import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function Road() {
  const { gameData } = useGame()
  const roadRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (roadRef.current && gameData.gameState === 'playing') {
      // Move road texture or segments to create movement effect
      // This is a simple implementation - road segments could be added later
    }
  })

  return (
    <group ref={roadRef}>
      {/* Main road surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 100]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Lane dividers */}
      {[-2.67, 2.67].map((laneX, index) => (
        <mesh key={index} position={[laneX, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.01, 100]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#333333"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Center line */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.01, 100]} />
        <meshStandardMaterial 
          color="#FFFF00" 
          emissive="#FFFF00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Road edges */}
      <mesh position={[-4, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.01, 100]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      <mesh position={[4, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.01, 100]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Shoulders */}
      <mesh position={[-6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}
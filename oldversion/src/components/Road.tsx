import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function Road() {
  const { motorcycle, gameState, isDayMode } = useGameStore()
  const roadRef = useRef<THREE.Group>(null)

  // Calculate road parameters dynamically
  const roadParams = useMemo(() => {
    const segmentLength = 20
    const numberOfSegments = 10
    const resetThreshold = -100
    const segmentSpacing = segmentLength * numberOfSegments
    
    return {
      segmentLength,
      numberOfSegments,
      resetThreshold,
      segmentSpacing
    }
  }, [])

  useFrame(() => {
    if (gameState === 'playing' && roadRef.current) {
      // Move road segments backwards to create infinite road effect
      roadRef.current.children.forEach((segment) => {
        segment.position.z -= motorcycle.speed * 0.1
        
        // Reset segment position when it goes behind the camera
        if (segment.position.z < roadParams.resetThreshold) {
          segment.position.z += roadParams.segmentSpacing
        }
      })
    }
  })

  const roadSegments = Array.from({ length: roadParams.numberOfSegments }, (_, i) => ({
    id: i,
    position: [0, 0, i * roadParams.segmentLength + roadParams.resetThreshold] as [number, number, number]
  }))

  return (
    <group ref={roadRef}>
      {roadSegments.map((segment) => (
        <RoadSegment
          key={segment.id}
          position={segment.position as [number, number, number]}
          isDayMode={isDayMode}
        />
      ))}
    </group>
  )
}

function RoadSegment({ position, isDayMode }: { position: [number, number, number], isDayMode: boolean }) {
  return (
    <group position={position}>
      {/* Main road surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 20]} />
        <meshStandardMaterial color={isDayMode ? '#333333' : '#1a1a1a'} />
      </mesh>
      
      {/* Lane markers */}
      {[-2.67, 0, 2.67].map((laneX, index) => (
        <mesh key={index} position={[laneX, 0.06, 0]}>
          <boxGeometry args={[0.1, 0.01, 20]} />
          <meshStandardMaterial 
            color={isDayMode ? '#FFFFFF' : '#FFD700'} 
            emissive={isDayMode ? '#333333' : '#FFD700'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Road edge lines */}
      <mesh position={[-4, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.01, 20]} />
        <meshStandardMaterial color={isDayMode ? '#FFFFFF' : '#FFA500'} />
      </mesh>
      
      <mesh position={[4, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.01, 20]} />
        <meshStandardMaterial color={isDayMode ? '#FFFFFF' : '#FFA500'} />
      </mesh>
      
      {/* Shoulders */}
      <mesh position={[-6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 20]} />
        <meshStandardMaterial color={isDayMode ? '#8B4513' : '#654321'} />
      </mesh>
      
      <mesh position={[6, 0, 0]} receiveShadow>
        <boxGeometry args={[2, 0.1, 20]} />
        <meshStandardMaterial color={isDayMode ? '#8B4513' : '#654321'} />
      </mesh>
    </group>
  )
}
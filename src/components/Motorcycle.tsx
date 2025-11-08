import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function Motorcycle() {
  const { gameData } = useGame()
  const motorcycleRef = useRef<THREE.Group>(null)
  const lanePositions = useMemo(() => [-2.67, 0, 2.67], [])

  useFrame(() => {
    if (motorcycleRef.current && gameData.gameState === 'playing') {
      // Smoothly interpolate to target lane position
      const targetX = lanePositions[gameData.motorcycle.lane]
      motorcycleRef.current.position.x = THREE.MathUtils.lerp(
        motorcycleRef.current.position.x,
        targetX,
        0.15
      )

      // Update the position in state
      // This is handled in the store by the move action
    }
  })

  return (
    <group ref={motorcycleRef} position={gameData.motorcycle.position}>
      <MotorcycleModel health={gameData.motorcycle.health} />
    </group>
  )
}

function MotorcycleModel({ health }: { health: number }) {
  const healthColor = health > 50 ? '#FF4444' : health > 25 ? '#FF8844' : '#FF4444'
  
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 1.2]} />
        <meshStandardMaterial color={healthColor} metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Front wheel */}
      <mesh position={[0, 0.3, 0.6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Rear wheel */}
      <mesh position={[0, 0.3, -0.6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Handlebars */}
      <mesh position={[0, 0.8, 0.4]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Seat */}
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Engine */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.8]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Exhaust */}
      <mesh position={[-0.3, 0.3, -0.8]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Health indicator - glow when low health */}
      {health < 50 && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={health < 25 ? 0.8 : 0.4}
          />
        </mesh>
      )}
    </group>
  )
}
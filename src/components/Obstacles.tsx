import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function Obstacles() {
  const { gameData } = useGame()
  const obstaclesRef = useRef<THREE.Group>(null)

  if (gameData.gameState !== 'playing' || gameData.obstacles.length === 0) {
    return null
  }

  return (
    <group ref={obstaclesRef}>
      {gameData.obstacles.map((obstacle) => (
        <ObstacleModel 
          key={obstacle.id} 
          obstacle={obstacle}
        />
      ))}
    </group>
  )
}

function ObstacleModel({ obstacle }: { obstacle: any }) {
  const obstacleRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (obstacleRef.current && obstacle.active) {
      obstacleRef.current.position.set(
        obstacle.position[0],
        obstacle.position[1], 
        obstacle.position[2]
      )
      obstacleRef.current.visible = true
    } else if (obstacleRef.current) {
      obstacleRef.current.visible = false
    }
  })

  return (
    <group ref={obstacleRef} position={obstacle.position}>
      {obstacle.type === 'car' && <CarModel />}
      {obstacle.type === 'cone' && <ConeModel />}
      {obstacle.type === 'truck' && <TruckModel />}
    </group>
  )
}

function CarModel() {
  return (
    <group>
      {/* Car body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.6, 3]} />
        <meshStandardMaterial color="#FF4444" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.9, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2]} />
        <meshStandardMaterial color="#CC3333" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Wheels */}
      {[[-0.7, 0.2, 1], [0.7, 0.2, 1], [-0.7, 0.2, -1], [0.7, 0.2, -1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  )
}

function ConeModel() {
  return (
    <mesh position={[0, 0.8, 0]} castShadow>
      <cylinderGeometry args={[0, 0.5, 1.6]} />
      <meshStandardMaterial color="#FF8800" />
    </mesh>
  )
}

function TruckModel() {
  return (
    <group>
      {/* Truck body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 1, 4]} />
        <meshStandardMaterial color="#4444FF" metalness={0.2} roughness={0.6} />
      </mesh>
      
      {/* Truck cab */}
      <mesh position={[0, 0.8, 1]} castShadow>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#3366CC" metalness={0.2} roughness={0.6} />
      </mesh>
      
      {/* Wheels */}
      {[[-0.9, 0.25, 1.5], [0.9, 0.25, 1.5], [-0.9, 0.25, -1.5], [0.9, 0.25, -1.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  )
}
import React, { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function Obstacles() {
  const {
    motorcycle,
    gameState,
    stats,
    updateStats,
    updateMotorcycle,
    powerUps,
    setGameState
  } = useGameStore()
  const obstaclesRef = useRef<THREE.Group>(null)

  // Generate initial obstacles
  const initialObstacles = useMemo(() => {
    const obstacles = []
    for (let i = 0; i < 20; i++) {
      obstacles.push({
        id: i,
        type: ['car', 'cone', 'truck', 'pothole'][Math.floor(Math.random() * 4)] as 'car' | 'cone' | 'truck' | 'pothole',
        lane: Math.floor(Math.random() * 3),
        z: 50 + (i * 20) + Math.random() * 30, // Start further ahead (positive Z) - coming from "upper area"
        active: true
      })
    }
    return obstacles
  }, [])

  const [obstacles, setObstacles] = useState(initialObstacles)

  const handleCollision = useCallback((obstacleIndex: number) => {
    if (!obstacles[obstacleIndex].active) return

    // Deactivate obstacle
    setObstacles(prev => prev.map((obstacle, index) =>
      index === obstacleIndex ? { ...obstacle, active: false } : obstacle
    ))

    // Check if shield is active
    if (!powerUps.shield.active) {
      // Take less damage per hit
      const damage = 5 // Reduced from 25
      const newHealth = Math.max(0, motorcycle.health - damage)
      updateMotorcycle({ health: newHealth })

      // Update stats - smaller score penalty
      updateStats({ score: Math.max(0, stats.score - 10) }) // Reduced penalty

      // Check for game over only if health is completely depleted
      if (newHealth <= 0) {
        updateStats({ lives: stats.lives - 1 })
        if (stats.lives <= 1) {
          setGameState('gameOver')
        }
      }
    } else {
      // Shield absorbed the hit
      updateStats({ score: stats.score + 50 })
    }

    // Slightly longer cooldown before obstacle reappears
    setTimeout(() => {
      setObstacles(prev => prev.map((obstacle, index) =>
        index === obstacleIndex ? { ...obstacle, active: true } : obstacle
      ))
    }, 3000) // Increased from 2000
  }, [obstacles, powerUps.shield.active, motorcycle.health, stats.score, stats.lives, updateMotorcycle, updateStats, setGameState])

  useFrame(() => {
    if (gameState === 'playing' && obstaclesRef.current) {
      obstaclesRef.current.children.forEach((obstacle, index) => {
        // Move obstacles towards player (from positive Z to negative Z)
        obstacle.position.z -= motorcycle.speed * 0.1

        // Remove obstacles that passed behind the player
        if (obstacle.position.z < -20) {
          // Respawn obstacle at the top (far positive Z)
          const maxZ = Math.max(...Array.from(obstaclesRef.current?.children || []).map(child => child.position.z))
          const newZ = maxZ > 50 ? maxZ + 20 + Math.random() * 30 : 100 + Math.random() * 50
          obstacle.position.z = newZ
          obstacle.position.x = [-2.67, 0, 2.67][Math.floor(Math.random() * 3)]
          
          // Update obstacle type in state
          const newType = ['car', 'cone', 'truck', 'pothole'][Math.floor(Math.random() * 4)] as 'car' | 'cone' | 'truck' | 'pothole'
          setObstacles(prev => prev.map((obs, i) =>
            i === index ? { ...obs, type: newType, active: true } : obs
          ))
        }

        // Improved collision detection with bounding boxes
        const obstacleGroup = obstacle as THREE.Group
        const obstacleBox = new THREE.Box3().setFromObject(obstacleGroup)
        
        // Create a bounding box for the motorcycle (approximate size)
        const motorcycleBox = new THREE.Box3(
          new THREE.Vector3(motorcycle.position[0] - 0.4, motorcycle.position[1] - 0.2, motorcycle.position[2] - 0.6),
          new THREE.Vector3(motorcycle.position[0] + 0.4, motorcycle.position[1] + 0.8, motorcycle.position[2] + 0.6)
        )

        if (obstacleBox.intersectsBox(motorcycleBox) && obstacles[index].active) {
          handleCollision(index)
        }
      })
    }
  })

  if (gameState !== 'playing') return null

  return (
    <group ref={obstaclesRef}>
      {obstacles.map((obstacle) => (
        <ObstacleModel
          key={obstacle.id}
          type={obstacle.type}
          position={[
            [-2.67, 0, 2.67][obstacle.lane],
            0,
            obstacle.z
          ] as [number, number, number]}
          active={obstacle.active}
        />
      ))}
    </group>
  )
}

function ObstacleModel({ 
  type, 
  position, 
  active 
}: { 
  type: 'car' | 'cone' | 'truck' | 'pothole'
  position: [number, number, number]
  active: boolean 
}) {
  const obstacleRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!active && obstacleRef.current) {
      // Hide inactive obstacles
      obstacleRef.current.visible = false
    } else if (obstacleRef.current) {
      obstacleRef.current.visible = true
    }
  })

  return (
    <group ref={obstacleRef} position={position}>
      {type === 'car' && <CarModel />}
      {type === 'cone' && <ConeModel />}
      {type === 'truck' && <TruckModel />}
      {type === 'pothole' && <PotholeModel />}
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

function PotholeModel() {
  return (
    <mesh position={[0, -0.05, 0]} receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.1]} />
      <meshStandardMaterial color="#2C1810" />
    </mesh>
  )
}
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function Motorcycle() {
  const { motorcycle, gameState, updateMotorcycle } = useGameStore()
  const motorcycleRef = useRef<THREE.Group>(null)

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState === 'playing') {
        switch (event.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (motorcycle.lane > 0) {
              updateMotorcycle({ lane: motorcycle.lane - 1 })
            }
            break
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (motorcycle.lane < 2) {
              updateMotorcycle({ lane: motorcycle.lane + 1 })
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, motorcycle.lane, updateMotorcycle])

  useFrame(() => {
    if (gameState === 'playing' && motorcycleRef.current) {
      // Update motorcycle position based on current lane
      const lanePositions = [-2.67, 0, 2.67]
      const targetX = lanePositions[motorcycle.lane]
      
      // Smooth lane switching
      motorcycleRef.current.position.x = THREE.MathUtils.lerp(
        motorcycleRef.current.position.x,
        targetX,
        0.1
      )

      // Apply tilt effect during lane switching
      if (Math.abs(motorcycleRef.current.position.x - targetX) > 0.1) {
        motorcycleRef.current.rotation.z = THREE.MathUtils.lerp(
          motorcycleRef.current.rotation.z,
          targetX > motorcycleRef.current.position.x ? -0.2 : 0.2,
          0.1
        )
      } else {
        motorcycleRef.current.rotation.z = THREE.MathUtils.lerp(
          motorcycleRef.current.rotation.z,
          0,
          0.1
        )
      }

      // Update motorcycle position in store
      updateMotorcycle({
        position: [
          motorcycleRef.current.position.x,
          motorcycleRef.current.position.y,
          motorcycleRef.current.position.z
        ]
      })
    }
  })

  return (
    <group ref={motorcycleRef} position={motorcycle.position}>
      <MotorcycleModel motorcycle={motorcycle} />
      <UpgradeEffects motorcycle={motorcycle} />
    </group>
  )
}

function MotorcycleModel({ motorcycle }: { motorcycle: any }) {
  const { upgrades } = motorcycle

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 1.2]} />
        <meshStandardMaterial 
          color={getMotorcycleColor(upgrades.engine)}
          metalness={0.3}
          roughness={0.4}
        />
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
    </group>
  )
}

function UpgradeEffects({ motorcycle }: { motorcycle: any }) {
  const { upgrades } = motorcycle
  const { powerUps } = useGameStore()

  return (
    <group>
      {/* Engine upgrade glow */}
      {upgrades.engine > 1 && (
        <mesh position={[0, 0.4, 0.2]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial
            color="#FF4444"
            emissive="#FF2222"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Turbo effect */}
      {powerUps.turbo.active && (
        <group>
          <mesh position={[-0.4, 0.3, -0.9]}>
            <cylinderGeometry args={[0.1, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#00FFFF"
              emissive="#0088FF"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0.4, 0.3, -0.9]}>
            <cylinderGeometry args={[0.1, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#00FFFF"
              emissive="#0088FF"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}
      
      {/* Shield effect */}
      {powerUps.shield.active && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.5]} />
          <meshStandardMaterial
            color="#4488FF"
            emissive="#2244FF"
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}

function getMotorcycleColor(engineLevel: number): string {
  const colors = ['#FF4444', '#4444FF', '#44FF44', '#FFFF44', '#FF44FF', '#44FFFF']
  return colors[Math.min(engineLevel - 1, colors.length - 1)]
}
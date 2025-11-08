import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function PowerUps() {
  const { motorcycle, gameState, stats, updateStats, activatePowerUp } = useGameStore()
  const powerUpsRef = useRef<THREE.Group>(null)

  // Generate initial power-ups
  const initialPowerUps = useMemo(() => {
    const powerUps = []
    for (let i = 0; i < 10; i++) {
      powerUps.push({
        id: i,
        type: ['shield', 'turbo', 'magnet'][Math.floor(Math.random() * 3)] as 'shield' | 'turbo' | 'magnet',
        lane: Math.floor(Math.random() * 3),
        z: 30 + (i * 25) + Math.random() * 100,
        active: true,
        collected: false
      })
    }
    return powerUps
  }, [])

  const [powerUps, setPowerUps] = React.useState(initialPowerUps)

  useFrame(() => {
    if (gameState === 'playing' && powerUpsRef.current) {
      powerUpsRef.current.children.forEach((powerUp, index) => {
        // Move power-ups towards player
        powerUp.position.z -= motorcycle.speed * 0.1

        // Remove power-ups that passed behind the player
        if (powerUp.position.z < -20) {
          // Respawn power-up at the end
          const maxZ = Math.max(...Array.from(powerUpsRef.current?.children || []).map(child => child.position.z))
          powerUp.position.z = maxZ + 25 + Math.random() * 100
          powerUp.position.x = [-2.67, 0, 2.67][Math.floor(Math.random() * 3)]
          
          // Reset collected state
          const powerUpGroup = powerUp as THREE.Group
          powerUpGroup.children.forEach(child => {
            if (child.userData.collected !== undefined) {
              child.userData.collected = false
            }
          })
        }

        // Collection detection
        const distance = Math.sqrt(
          Math.pow(powerUp.position.x - motorcycle.position[0], 2) +
          Math.pow(powerUp.position.z - motorcycle.position[2], 2)
        )

        if (distance < 1.5 && !powerUps[index].collected) {
          // Power-up collected!
          powerUps[index].collected = true
          
          // Activate the power-up
          activatePowerUp(powerUps[index].type)
          
          // Update stats
          updateStats({ 
            coins: stats.coins + 25,
            score: stats.score + 200
          })

          // Hide power-up temporarily
          setTimeout(() => {
            powerUps[index].collected = false
          }, 2000)
        }
      })
    }
  })

  if (gameState !== 'playing') return null

  return (
    <group ref={powerUpsRef}>
      {powerUps.map((powerUp) => (
        <PowerUpModel
          key={powerUp.id}
          type={powerUp.type}
          position={[
            [-2.67, 0, 2.67][powerUp.lane],
            1,
            powerUp.z
          ] as [number, number, number]}
          collected={powerUp.collected}
        />
      ))}
    </group>
  )
}

function PowerUpModel({ 
  type, 
  position, 
  collected 
}: { 
  type: 'shield' | 'turbo' | 'magnet'
  position: [number, number, number]
  collected: boolean 
}) {
  const powerUpRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (powerUpRef.current) {
      if (collected) {
        powerUpRef.current.visible = false
      } else {
        powerUpRef.current.visible = true
        // Floating animation
        powerUpRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
        // Rotation animation
        powerUpRef.current.rotation.y += 0.02
      }
    }
  })

  return (
    <group ref={powerUpRef} position={position}>
      {type === 'shield' && <ShieldModel />}
      {type === 'turbo' && <TurboModel />}
      {type === 'magnet' && <MagnetModel />}
    </group>
  )
}

function ShieldModel() {
  return (
    <group>
      {/* Shield base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial 
          color="#4488FF" 
          emissive="#2244FF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Shield glow */}
      <mesh>
        <sphereGeometry args={[0.8]} />
        <meshStandardMaterial 
          color="#4488FF" 
          emissive="#2244FF"
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Shield symbol */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

function TurboModel() {
  return (
    <group>
      {/* Turbo base */}
      <mesh castShadow>
        <coneGeometry args={[0.5, 1]} />
        <meshStandardMaterial 
          color="#FF6600" 
          emissive="#FF3300"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Turbo flames */}
      <mesh position={[0, -0.8, 0]}>
        <coneGeometry args={[0.2, 0.6]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#0088FF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Lightning bolts */}
      <mesh position={[0.2, 0.2, 0.2]} rotation={[0, 0, Math.PI/4]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial 
          color="#FFFF00" 
          emissive="#FFFF00"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.2]} rotation={[0, 0, -Math.PI/4]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial 
          color="#FFFF00" 
          emissive="#FFFF00"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

function MagnetModel() {
  return (
    <group>
      {/* Magnet base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.3]} />
        <meshStandardMaterial 
          color="#FF4444" 
          emissive="#CC0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Magnet top */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Magnet poles */}
      <mesh position={[-0.3, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.3, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Magnetic field visualization */}
      <mesh position={[0, 1, 0]}>
        <torusGeometry args={[1.2, 0.1]} />
        <meshStandardMaterial 
          color="#4488FF" 
          emissive="#2244FF"
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function Camera() {
  const { camera } = useThree()
  const { motorcycle, gameState } = useGameStore()
  const cameraRef = useRef<THREE.Object3D>(null)

  useFrame(() => {
    if (gameState === 'playing' && motorcycle) {
      // Third-person camera following the motorcycle
      const targetPosition = [
        motorcycle.position[0],
        motorcycle.position[1] + 5,
        motorcycle.position[2] + 10
      ]
      
      camera.position.lerp(new THREE.Vector3(...targetPosition), 0.1)
      camera.lookAt(motorcycle.position[0], motorcycle.position[1], motorcycle.position[2] - 10)
    }
  })

  return null
}
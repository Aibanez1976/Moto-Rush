import { useFrame, useThree } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function GameCamera() {
  const { camera } = useThree()
  const { gameData } = useGame()

  useFrame(() => {
    if (gameData.gameState === 'playing') {
      // Camera follows motorcycle but stays fixed relative to world
      // This creates the illusion of forward movement
      const motorcyclePos = gameData.motorcycle.position
      const targetPosition = new THREE.Vector3(
        motorcyclePos[0], // Follow horizontal position exactly
        8,  // Fixed height
        motorcyclePos[2] + 12 // Stay 12 units behind motorcycle
      )

      camera.position.lerp(targetPosition, 0.1) // Smooth following
      camera.lookAt(motorcyclePos[0], motorcyclePos[1], motorcyclePos[2] - 2)
    }
  })

  return null
}
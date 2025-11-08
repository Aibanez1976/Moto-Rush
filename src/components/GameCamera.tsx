import { useFrame, useThree } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import * as THREE from 'three'

export function GameCamera() {
  const { camera } = useThree()
  const { gameData } = useGame()

  useFrame(() => {
    if (gameData.gameState === 'playing') {
      // Smooth camera following the motorcycle
      const motorcyclePos = gameData.motorcycle.position
      const targetPosition = new THREE.Vector3(
        motorcyclePos[0] * 0.3, // Smooth horizontal following
        8,
        12
      )
      
      camera.position.lerp(targetPosition, 0.05)
      camera.lookAt(motorcyclePos[0], motorcyclePos[1], motorcyclePos[2] - 5)
    }
  })

  return null
}
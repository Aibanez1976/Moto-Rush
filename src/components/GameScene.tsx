import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from '../store/gameContext'
import { GameLogic } from './GameLogic'
import { GameCamera } from './GameCamera'
import { Motorcycle } from './Motorcycle'
import { Road } from './Road'
import { Obstacles } from './Obstacles'
import { CVController } from './CVController'

export function GameScene() {
  const { gameData } = useGame()

  if (gameData.gameState !== 'playing') return null

  return (
    <>
      <Canvas
        camera={{ position: [0, 8, 12], fov: 75 }}
        className="game-canvas"
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Game Components */}
        <GameCamera />
        <GameLogic />
        <Motorcycle />
        <Road />
        <Obstacles />
      </Canvas>
      
      {/* AI Camera Controller with Teachable Machine model */}
      <CVController />
    </>
  )
}
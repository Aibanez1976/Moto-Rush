import { useGameStore } from '../store/gameStore'
import { Motorcycle } from './Motorcycle'
import { Road } from './Road'
import { Obstacles } from './Obstacles'
import { Lighting } from './Lighting'
import { ParticleSystem } from './ParticleSystem'
import { GameController } from './GameController'

export function GameScene() {
  const { gameState } = useGameStore()

  if (gameState !== 'playing') {
    return null
  }

  return (
    <>
      <Lighting />
      <GameController />
      <Motorcycle />
      <Road />
      <Obstacles />
      <ParticleSystem />
    </>
  )
}
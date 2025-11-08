import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

export function GameController() {
  const {
    gameState,
    motorcycle,
    stats,
    difficulty,
    updateMotorcycle,
    updateStats,
    setGameState,
    cvControlEnabled,
    cvPrediction
  } = useGameStore()

  const touchStartX = useRef(0)
  const lastLaneChangeTime = useRef(0)

  // Keyboard controls (using 'P' to pause instead of immediately returning to menu)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        if (gameState === 'playing') {
          setGameState('paused')
        } else if (gameState === 'paused') {
          setGameState('playing')
        }
      }
      // Commenting out the escape handler to prevent immediate return to menu
      // if (event.key === 'Escape') {
      //   if (gameState === 'playing') {
      //     setGameState('menu')
      //   }
      // }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, setGameState])

  // Mobile touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (gameState === 'playing') {
        touchStartX.current = e.touches[0].clientX
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState === 'playing') {
        const touchEndX = e.changedTouches[0].clientX
        const diff = touchEndX - touchStartX.current

        if (Math.abs(diff) > 50) {
          const now = Date.now()
          if (now - lastLaneChangeTime.current > 200) {
            if (diff > 0 && motorcycle.lane < 2) {
              updateMotorcycle({ lane: motorcycle.lane + 1 })
            } else if (diff < 0 && motorcycle.lane > 0) {
              updateMotorcycle({ lane: motorcycle.lane - 1 })
            }
            lastLaneChangeTime.current = now
          }
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState, motorcycle.lane, updateMotorcycle])

  // Computer Vision control
  useEffect(() => {
    if (gameState === 'playing' && cvControlEnabled) {
      const now = Date.now()
      if (now - lastLaneChangeTime.current > 300) {
        if (cvPrediction === 'Izquierda' && motorcycle.lane > 0) {
          updateMotorcycle({ lane: motorcycle.lane - 1 })
          lastLaneChangeTime.current = now
        } else if (cvPrediction === 'Derecha' && motorcycle.lane < 2) {
          updateMotorcycle({ lane: motorcycle.lane + 1 })
          lastLaneChangeTime.current = now
        }
      }
    }
  }, [gameState, cvControlEnabled, cvPrediction, motorcycle.lane, updateMotorcycle])

  // Game loop logic
  useFrame((_state, delta) => {
    if (gameState === 'playing') {
      // Increase speed based on difficulty and level
      const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'normal' ? 1 : 1.2
      const speedIncrease = 0.05 * difficultyMultiplier * (1 + stats.level * 0.1)
      const maxSpeed = 30 * difficultyMultiplier + stats.level * 2

      let newSpeed = motorcycle.speed + speedIncrease
      if (newSpeed > maxSpeed) newSpeed = maxSpeed

      updateMotorcycle({ speed: newSpeed })

      // Update distance and score
      const distanceIncrease = newSpeed * delta * 0.1
      const scoreIncrease = Math.floor(distanceIncrease * 10)

      updateStats({
        distance: stats.distance + distanceIncrease,
        score: stats.score + scoreIncrease
      })

      // Level progression
      const newLevel = Math.floor(stats.distance / 500) + 1
      if (newLevel > stats.level) {
        updateStats({ level: newLevel })
      }

      // Health regeneration (slow)
      if (motorcycle.health < 100) {
        updateMotorcycle({
          health: Math.min(motorcycle.health + 0.1, 100)
        })
      }

      // Check for game over
      if (stats.lives <= 0) {
        setGameState('gameOver')
      }
    }
  })

  return null
}
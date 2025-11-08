import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../store/gameContext'

export function GameController() {
  const { gameData, dispatch } = useGame()

  const {
    gameState,
    motorcycle,
    stats,
    controlMethod
  } = gameData

  const touchStartX = useRef(0)
  const lastLaneChangeTime = useRef(0)

  // Keyboard controls (using 'P' to pause instead of immediately returning to menu)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        if (gameState === 'playing') {
          dispatch({ type: 'SET_GAME_STATE', payload: 'paused' })
        } else if (gameState === 'paused') {
          dispatch({ type: 'SET_GAME_STATE', payload: 'playing' })
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
  }, [gameState, dispatch])

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
              dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'right' })
            } else if (diff < 0 && motorcycle.lane > 0) {
              dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'left' })
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
  }, [gameState, motorcycle.lane, dispatch])

  // Computer Vision control
 useEffect(() => {
   if (gameState === 'playing' && controlMethod === 'camera') {
     const now = Date.now()
     if (now - lastLaneChangeTime.current > 300) {
       // In the new architecture, CV control is handled by CVController and sends movement events
       // This area is now commented out as CV logic is handled in CVController
       // The actual movement happens through dispatch events from CVController
     }
   }
 }, [gameState, controlMethod, motorcycle.lane])

  // Game loop logic
  useFrame((_state, delta) => {
    if (gameState === 'playing') {
      // Increase speed based on level
      const speedIncrease = 0.02 * (1 + stats.level * 0.1)
      const maxSpeed = 25 + stats.level * 2
      const newSpeed = Math.min(motorcycle.speed + speedIncrease, maxSpeed)

      dispatch({
        type: 'UPDATE_MOTORCYCLE',
        payload: { speed: newSpeed }
      })

      // Update distance and score
      const distanceIncrease = newSpeed * delta * 0.05
      const scoreIncrease = Math.floor(distanceIncrease * 2)

      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          distance: stats.distance + distanceIncrease,
          score: stats.score + scoreIncrease
        }
      })

      // Level progression
      const newLevel = Math.floor(stats.distance / 200) + 1
      if (newLevel > stats.level) {
        dispatch({
          type: 'UPDATE_STATS',
          payload: { level: newLevel }
        })
      }

      // Health regeneration (slow)
      if (motorcycle.health < 100) {
        dispatch({
          type: 'UPDATE_MOTORCYCLE',
          payload: { health: Math.min(100, motorcycle.health + 0.1) }
        })
      }

      // Check for game over
      if (stats.lives <= 0) {
        dispatch({ type: 'SET_GAME_STATE', payload: 'gameOver' })
      }
    }
  })

  return null
}
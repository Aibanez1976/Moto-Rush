import React, { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame, gameUtils } from '../store/gameContext'

export function GameLogic() {
  const { gameData, dispatch } = useGame()

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameData.gameState !== 'playing') return

      switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          event.preventDefault()
          dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'left' })
          break
        case 'arrowright':
        case 'd':
          event.preventDefault()
          dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'right' })
          break
        case 'p':
          event.preventDefault()
          dispatch({ type: 'SET_GAME_STATE', payload: 'paused' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameData.gameState, dispatch])

  // Touch controls
  useEffect(() => {
    let touchStartX = 0
    let lastTouchTime = 0

    const handleTouchStart = (event: TouchEvent) => {
      if (gameData.gameState !== 'playing') return
      touchStartX = event.touches[0].clientX
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (gameData.gameState !== 'playing') return

      const touchEndX = event.changedTouches[0].clientX
      const diff = touchEndX - touchStartX
      const now = Date.now()

      // Prevent rapid touches
      if (now - lastTouchTime < 200) return

      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'right' })
        } else {
          dispatch({ type: 'MOVE_MOTORCYCLE', payload: 'left' })
        }
        lastTouchTime = now
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameData.gameState, dispatch])

  // Game loop - runs every frame
  useFrame((_, delta) => {
    if (gameData.gameState !== 'playing') return

    // Update motorcycle position and speed - ULTRA FAST SPEED
    const speedIncrease = 0.15 * (1 + gameData.stats.level * 0.2)  // Increased from 0.05
    const maxSpeed = 60 + gameData.stats.level * 5  // Increased from 35
    const newSpeed = Math.min(gameData.motorcycle.speed + speedIncrease, maxSpeed)

    dispatch({
      type: 'UPDATE_MOTORCYCLE',
      payload: { speed: newSpeed }
    })

    // Update distance and score - ULTRA FAST PROGRESSION
    const distanceIncrease = newSpeed * delta * 0.2  // Increased from 0.1
    const scoreIncrease = Math.floor(distanceIncrease * 10)  // Increased from 5

    dispatch({
      type: 'UPDATE_STATS',
      payload: {
        distance: gameData.stats.distance + distanceIncrease,
        score: gameData.stats.score + scoreIncrease
      }
    })

    // Level progression - ULTRA FAST LEVELING
    const newLevel = Math.floor(gameData.stats.distance / 50) + 1  // Reduced from 100
    if (newLevel > gameData.stats.level) {
      dispatch({
        type: 'UPDATE_STATS',
        payload: { level: newLevel }
      })
    }

    // Update obstacles - Move obstacles toward player to create forward movement sensation
    gameData.obstacles.forEach(obstacle => {
      if (obstacle.active) {
        // Move obstacles toward player at the same speed as motorcycle for realistic approach
        const obstacleSpeed = newSpeed
        const updatedObstacle = {
          ...obstacle,
          position: [obstacle.position[0], obstacle.position[1], obstacle.position[2] - obstacleSpeed * delta] as [number, number, number]
        } as any

        // Check collision
        if (gameUtils.checkCollision(gameData.motorcycle, updatedObstacle)) {
          // Handle collision
          const newHealth = Math.max(0, gameData.motorcycle.health - 10)
          dispatch({
            type: 'UPDATE_MOTORCYCLE',
            payload: { health: newHealth }
          })

          // Remove obstacle
          dispatch({ type: 'REMOVE_OBSTACLE', payload: obstacle.id })

          // Check game over
          if (newHealth <= 0) {
            const newLives = gameData.stats.lives - 1
            if (newLives <= 0) {
              dispatch({ type: 'SET_GAME_STATE', payload: 'gameOver' })
            } else {
              dispatch({ type: 'UPDATE_STATS', payload: { lives: newLives } })
              // Reset health
              dispatch({
                type: 'UPDATE_MOTORCYCLE',
                payload: { health: 100 }
              })
            }
          }
        }

        // Remove obstacles that passed behind the player (negative Z means behind)
        if (updatedObstacle.position[2] < -10) {
          dispatch({ type: 'REMOVE_OBSTACLE', payload: obstacle.id })
        }
      }
    })

    // Spawn new obstacles - MORE FREQUENT FOR FAST GAMEPLAY
    if (gameData.obstacles.length < 8) {  // Increased from 5 to 8
      const newObstacle = gameUtils.createObstacle(`obs-${Date.now()}-${Math.random()}`)
      dispatch({ type: 'ADD_OBSTACLE', payload: newObstacle })
    }

    // Health regeneration (slow)
    if (gameData.motorcycle.health < 100) {
      dispatch({
        type: 'UPDATE_MOTORCYCLE',
        payload: { health: Math.min(100, gameData.motorcycle.health + 0.1) }
      })
    }
  })

  return null
}
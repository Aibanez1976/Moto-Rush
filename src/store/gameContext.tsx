// Clean, simple state management using React Context
// No complex dependencies or middleware

import React, { createContext, useContext, useReducer } from 'react'

// Game state types
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver'

// Control types
export type ControlMethod = 'camera' // Only camera control now

// Game data interfaces
export interface Motorcycle {
  lane: number // 0, 1, 2 (left, center, right)
  position: [number, number, number]
  speed: number
  health: number
}

export interface Obstacle {
  id: string
  type: 'car' | 'cone' | 'truck'
  lane: number
  position: [number, number, number]
  active: boolean
}

export interface GameStats {
  score: number
  distance: number
  level: number
  lives: number
}

export interface GameData {
  gameState: GameState
  controlMethod: ControlMethod
  motorcycle: Motorcycle
  obstacles: Obstacle[]
  stats: GameStats
  cameraEnabled: boolean
  cameraError: string | null
}

// Action types
export type GameAction =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_CONTROL_METHOD'; payload: ControlMethod }
  | { type: 'MOVE_MOTORCYCLE'; payload: 'left' | 'right' }
  | { type: 'SET_MOTORCYCLE_LANE'; payload: number } // NEW: Direct lane setting
  | { type: 'ADD_OBSTACLE'; payload: Obstacle }
  | { type: 'REMOVE_OBSTACLE'; payload: string }
  | { type: 'UPDATE_MOTORCYCLE'; payload: Partial<Motorcycle> }
  | { type: 'UPDATE_STATS'; payload: Partial<GameStats> }
  | { type: 'SET_CAMERA_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' }

// Initial state
const initialGameData: GameData = {
  gameState: 'menu',
  controlMethod: 'camera',
  motorcycle: {
    lane: 1,
    position: [0, 1, 0],
    speed: 10,
    health: 100
  },
  obstacles: [],
  stats: {
    score: 0,
    distance: 0,
    level: 1,
    lives: 3
  },
  cameraEnabled: false,
  cameraError: null
}

// State management
function gameReducer(state: GameData, action: GameAction): GameData {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload }
    
    case 'SET_CONTROL_METHOD':
      return { ...state, controlMethod: action.payload }
    
    case 'MOVE_MOTORCYCLE':
      console.log(`🎮 MOVE_MOTORCYCLE: ${action.payload}`)
      const newLane = action.payload === 'left'
        ? Math.max(0, state.motorcycle.lane - 1)
        : Math.min(2, state.motorcycle.lane + 1)
      const lanePositions = [-2.67, 0, 2.67]
      console.log(`🎮 Lane change: ${state.motorcycle.lane} → ${newLane}`)
      return {
        ...state,
        motorcycle: {
          ...state.motorcycle,
          lane: newLane,
          position: [lanePositions[newLane], state.motorcycle.position[1], state.motorcycle.position[2]]
        }
      }

    case 'SET_MOTORCYCLE_LANE':
      console.log(`🎯 SET_MOTORCYCLE_LANE: ${action.payload}`)
      const targetLane = Math.max(0, Math.min(2, action.payload)) // Clamp to 0-2
      const targetPositions = [-2.67, 0, 2.67]
      console.log(`🎯 Direct lane set: ${state.motorcycle.lane} → ${targetLane}`)
      return {
        ...state,
        motorcycle: {
          ...state.motorcycle,
          lane: targetLane,
          position: [targetPositions[targetLane], state.motorcycle.position[1], state.motorcycle.position[2]]
        }
      }
    
    case 'ADD_OBSTACLE':
      return {
        ...state,
        obstacles: [...state.obstacles, action.payload]
      }
    
    case 'REMOVE_OBSTACLE':
      return {
        ...state,
        obstacles: state.obstacles.filter(obs => obs.id !== action.payload)
      }
    
    case 'UPDATE_MOTORCYCLE':
      return {
        ...state,
        motorcycle: { ...state.motorcycle, ...action.payload }
      }
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      }
    
    case 'SET_CAMERA_ERROR':
      return { ...state, cameraError: action.payload }
    
    case 'RESET_GAME':
      return initialGameData
    
    default:
      return state
  }
}

// Context
const GameContext = createContext<{
  gameData: GameData
  dispatch: React.Dispatch<GameAction>
} | null>(null)

// Provider
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameData, dispatch] = useReducer(gameReducer, initialGameData)
  
  return (
    <GameContext.Provider value={{ gameData, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

// Hook
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// Game utilities
export const gameUtils = {
  // Generate random obstacle - SPAWN IN FRONT OF PLAYER FOR FORWARD MOVEMENT SENSATION
  createObstacle(id: string): Obstacle {
    const types: Obstacle['type'][] = ['car', 'cone', 'truck']
    const lanes = [0, 1, 2]
    const lanePositions = [-2.67, 0, 2.67]

    return {
      id,
      type: types[Math.floor(Math.random() * types.length)],
      lane: lanes[Math.floor(Math.random() * lanes.length)],
      position: [lanePositions[Math.floor(Math.random() * lanePositions.length)], 0, 25 + Math.random() * 50], // Spawn far ahead (25-75 units in front)
      active: true
    }
  },
  
  // Check collision between motorcycle and obstacle
  checkCollision(motorcycle: Motorcycle, obstacle: Obstacle): boolean {
    const laneDistance = Math.abs(motorcycle.lane - obstacle.lane)
    const positionDistance = Math.abs(motorcycle.position[2] - obstacle.position[2])
    
    // Collision if same lane and close in Z position
    return laneDistance === 0 && positionDistance < 1
  },
  
  // Calculate score based on distance and speed
  calculateScore(distance: number, level: number): number {
    return Math.floor(distance * 0.1 * level)
  }
}
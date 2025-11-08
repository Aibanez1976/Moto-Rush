import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'upgrades'

export interface Motorcycle {
  position: [number, number, number]
  lane: number // 0 = left, 1 = center, 2 = right
  speed: number
  health: number
  damage: number
  upgrades: {
    engine: number
    handling: number
    durability: number
  }
}

export interface GameStats {
  score: number
  coins: number
  distance: number
  level: number
  lives: number
}

export interface PowerUp {
  type: 'shield' | 'turbo' | 'magnet'
  duration: number
  active: boolean
}

interface GameStore {
  // Game state
  gameState: GameState
  isDayMode: boolean
  
  // CV Control
  cvControlEnabled: boolean
  cvPrediction: 'Centro' | 'Izquierda' | 'Derecha'
  cvConfidence: number
  
  // Motorcycle
  motorcycle: Motorcycle
  
  // Game stats
  stats: GameStats
  
  // Power-ups
  powerUps: {
    shield: PowerUp
    turbo: PowerUp
    magnet: PowerUp
  }
  
  // Game settings
  difficulty: 'easy' | 'normal' | 'hard'
  
  // Actions
  setGameState: (state: GameState) => void
  toggleDayNight: () => void
  updateMotorcycle: (updates: Partial<Motorcycle>) => void
  updateStats: (updates: Partial<GameStats>) => void
  activatePowerUp: (type: PowerUp['type']) => void
  deactivatePowerUp: (type: PowerUp['type']) => void
  resetGame: () => void
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void
  toggleCVControl: () => void
  updateCVPrediction: (prediction: 'Centro' | 'Izquierda' | 'Derecha', confidence: number) => void
}

const initialStats: GameStats = {
  score: 0,
  coins: 0,
  distance: 0,
  level: 1,
  lives: 3
}

const initialMotorcycle: Motorcycle = {
  position: [0, 1, 0],
  lane: 1,
  speed: 10,
  health: 100,
  damage: 0,
  upgrades: {
    engine: 1,
    handling: 1,
    durability: 1
  }
}

export const useGameStore = create<GameStore, [['zustand/subscribeWithSelector', GameStore]]>(
  subscribeWithSelector((set, get) => {
    console.log('Creating Zustand store with initial state')
    console.log('Initial gameState:', 'menu')
    
    return {
    // Initial state
    gameState: 'menu',
    isDayMode: true,
    cvControlEnabled: true,
    cvPrediction: 'Centro',
    cvConfidence: 0,
    motorcycle: initialMotorcycle,
    stats: initialStats,
    powerUps: {
      shield: { type: 'shield', duration: 0, active: false },
      turbo: { type: 'turbo', duration: 0, active: false },
      magnet: { type: 'magnet', duration: 0, active: false }
    },
    difficulty: 'normal',
    
    // Actions
    setGameState: (state) => {
      console.log('setGameState called with:', state)
      console.log('Current state before update:', get().gameState)
      set({ gameState: state })
      console.log('State after update:', get().gameState)
      // Force a subscription update to ensure all components are notified
      console.log('All store state:', get())
    },
    
    toggleDayNight: () => set((state) => ({ isDayMode: !state.isDayMode })),
    
    updateMotorcycle: (updates) => set((state) => ({
      motorcycle: { ...state.motorcycle, ...updates }
    })),
    
    updateStats: (updates) => set((state) => ({
      stats: { ...state.stats, ...updates }
    })),
    
    activatePowerUp: (type) => set((state) => {
      const powerUp = state.powerUps[type]
      return {
        powerUps: {
          ...state.powerUps,
          [type]: {
            ...powerUp,
            active: true,
            duration: type === 'shield' ? 10000 : type === 'turbo' ? 5000 : 15000
          }
        }
      }
    }),
    
    deactivatePowerUp: (type) => set((state) => ({
      powerUps: {
        ...state.powerUps,
        [type]: {
          ...state.powerUps[type],
          active: false,
          duration: 0
        }
      }
    })),
    
    resetGame: () => set({
      gameState: 'menu',
      isDayMode: true,
      cvControlEnabled: false,
      cvPrediction: 'Centro',
      cvConfidence: 0,
      motorcycle: initialMotorcycle,
      stats: initialStats,
      powerUps: {
        shield: { type: 'shield', duration: 0, active: false },
        turbo: { type: 'turbo', duration: 0, active: false },
        magnet: { type: 'magnet', duration: 0, active: false }
      }
    }),
    
    setDifficulty: (difficulty) => set({ difficulty }),
    
    toggleCVControl: () => set((state) => ({
      cvControlEnabled: !state.cvControlEnabled
    })),
    
    updateCVPrediction: (prediction, confidence) => set({
      cvPrediction: prediction,
      cvConfidence: confidence
    })
    }
  })
)
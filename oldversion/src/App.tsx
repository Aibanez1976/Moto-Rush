import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameScene } from './components/GameScene'
import { GameUI, GameHUD } from './components/GameUI'
import { useGameStore } from './store/gameStore'
import './App.css'

function App() {
  const { gameState, setGameState } = useGameStore()
  console.log('App - Current gameState:', gameState)
  
  // Subscribe to gameState changes
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state) => state.gameState,
      (newState) => {
        console.log('App subscription - gameState changed to:', newState)
      }
    )
    
    // Clean up subscription on unmount
    return () => unsubscribe()
  }, [])

  return (
    <div className="game-container">
      {/* Only render GameUI when gameState is not 'playing' */}
      {gameState !== 'playing' && <GameUI />}

      {/* Render Canvas only when gameState is 'playing' */}
      {gameState === 'playing' && (
        <>
          <Canvas
            camera={{ position: [0, 5, 10], fov: 75 }}
            className="game-canvas"
          >
            <GameScene />
          </Canvas>
          {/* Add GameHUD for game UI when playing */}
          <GameHUD />
          {/* Add a game overlay for game controls when playing */}
          <div className="game-overlay">
            <button
              className="menu-btn"
              onClick={() => setGameState('menu')}
            >
              🏠 Main Menu
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App

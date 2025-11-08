import React from 'react'
import { useGame } from '../store/gameContext'
import { MainMenu } from './MainMenu'
import { GameScene } from './GameScene'
import { GameHUD } from './GameHUD'

export function GameContainer() {
  const { gameData } = useGame()

  return (
    <div className="game-container">
      {gameData.gameState === 'menu' && <MainMenu />}
      {gameData.gameState === 'playing' && (
        <>
          <GameScene />
          <GameHUD />
        </>
      )}
      {gameData.gameState === 'paused' && <PausedScreen />}
      {gameData.gameState === 'gameOver' && <GameOverScreen />}
    </div>
  )
}

function PausedScreen() {
  const { dispatch } = useGame()

  return (
    <div className="pause-screen">
      <div className="pause-content">
        <h1>⏸️ PAUSED</h1>
        <p>Press P to continue</p>
        <button 
          className="menu-btn primary"
          onClick={() => dispatch({ type: 'SET_GAME_STATE', payload: 'playing' })}
        >
          CONTINUE
        </button>
        <button 
          className="menu-btn"
          onClick={() => dispatch({ type: 'SET_GAME_STATE', payload: 'menu' })}
        >
          MAIN MENU
        </button>
      </div>
    </div>
  )
}

function GameOverScreen() {
  const { gameData, dispatch } = useGame()

  return (
    <div className="game-over-screen">
      <div className="game-over-content">
        <h1>💀 GAME OVER</h1>
        <div className="final-stats">
          <div className="stat">
            <span>Score:</span>
            <span>{gameData.stats.score.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span>Distance:</span>
            <span>{Math.round(gameData.stats.distance)}m</span>
          </div>
          <div className="stat">
            <span>Level:</span>
            <span>{gameData.stats.level}</span>
          </div>
        </div>
        <div className="game-over-buttons">
          <button 
            className="menu-btn primary"
            onClick={() => dispatch({ type: 'RESET_GAME' })}
          >
            PLAY AGAIN
          </button>
          <button 
            className="menu-btn"
            onClick={() => dispatch({ type: 'SET_GAME_STATE', payload: 'menu' })}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  )
}
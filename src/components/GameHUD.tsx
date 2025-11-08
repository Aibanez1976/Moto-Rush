import React from 'react'
import { useGame } from '../store/gameContext'
import { CVController } from './CVController'

export function GameHUD() {
  const { gameData, dispatch } = useGame()

  if (gameData.gameState !== 'playing') return null

  return (
    <>
      {/* Top HUD */}
      <div className="game-hud top">
        <div className="hud-item">
          <span className="label">Speed</span>
          <span className="value">{Math.round(gameData.motorcycle.speed)}</span>
        </div>
        <div className="hud-item">
          <span className="label">Score</span>
          <span className="value">{gameData.stats.score.toLocaleString()}</span>
        </div>
        <div className="hud-item">
          <span className="label">Distance</span>
          <span className="value">{Math.round(gameData.stats.distance)}m</span>
        </div>
        <div className="hud-item">
          <span className="label">Level</span>
          <span className="value">{gameData.stats.level}</span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ width: `${gameData.motorcycle.health}%` }}
        />
        <span className="health-text">HP: {Math.round(gameData.motorcycle.health)}%</span>
      </div>

      {/* Lives */}
      <div className="lives">
        {Array.from({ length: gameData.stats.lives }, (_, i) => (
          <span key={i} className="life">❤️</span>
        ))}
      </div>

      {/* Controls Help */}
      <div className="controls-help">
        <div className="control-hint">
          <p>📷 Hand gestures: Left/Right/Center for movement</p>
        </div>
        <div className="control-hint">
          <p>⏸️ Press P to pause</p>
        </div>
      </div>

      {/* CV Controller - always show for camera control */}
      <CVController />

      {/* Camera Status */}
      {gameData.controlMethod === 'camera' && (
        <div className="camera-status">
          {gameData.cameraError ? (
            <div className="camera-error">
              <p>❌ Camera error: {gameData.cameraError}</p>
              <button 
                className="menu-btn small"
                onClick={() => alert('Camera control is required for this game')}
              >
                Switch to Keyboard
              </button>
            </div>
          ) : (
            <div className="camera-ready">
              <p>📷 Camera active - ready for hand gestures</p>
            </div>
          )}
        </div>
      )}

      {/* Pause Button */}
      <div className="pause-button">
        <button 
          className="menu-btn"
          onClick={() => dispatch({ type: 'SET_GAME_STATE', payload: 'paused' })}
        >
          ⏸️ Pause
        </button>
      </div>
    </>
  )
}
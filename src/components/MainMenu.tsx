import React, { useState, useEffect } from 'react'
import { useGame } from '../store/gameContext'

export function MainMenu() {
  const { gameData, dispatch } = useGame()
  const [showCameraDialog, setShowCameraDialog] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [isLoadingModel, setIsLoadingModel] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Load AI model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🔄 Pre-loading AI model...')
        // Pre-load the model to check if it's available
        const response = await fetch('https://teachablemachine.withgoogle.com/models/qjZp5Ulg9/model.json')
        if (response.ok) {
          console.log('✅ AI model is available')
          setModelLoaded(true)
        } else {
          console.error('❌ AI model not available')
        }
      } catch (error) {
        console.error('❌ Error checking AI model:', error)
      } finally {
        setIsLoadingModel(false)
      }
    }

    loadModel()
  }, [])

  const handleStartGame = () => {
    if (!modelLoaded) {
      alert('AI model is still loading. Please wait...')
      return
    }
    // Always use camera control - show permission dialog
    setShowCameraDialog(true)
  }

  const handleCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately, just testing permission
      setCameraPermission('granted')
      setShowCameraDialog(false)
      dispatch({ type: 'SET_GAME_STATE', payload: 'playing' })
    } catch (error) {
      setCameraPermission('denied')
    }
  }

  const handlePlayWithoutCamera = () => {
    // Camera is required - show error message
    alert('Camera control is required for this game. Please allow camera access to play.')
  }

  return (
    <>
      <div className="main-menu">
        <div className="menu-content">
          <h1>🏍️ MOTO RUSH</h1>
          <div className="subtitle">Fast-paced motorcycle racing action!</div>
          
          <div className="menu-buttons">
            <button
              className="menu-btn primary large"
              onClick={handleStartGame}
              disabled={isLoadingModel || !modelLoaded}
            >
              {isLoadingModel ? '⏳ LOADING AI MODEL...' : modelLoaded ? '🚀 START GAME' : '❌ MODEL UNAVAILABLE'}
            </button>

            {isLoadingModel && (
              <div className="loading-status">
                <p>🤖 Preparing AI Vision Control...</p>
                <p>This may take a few seconds</p>
              </div>
            )}

            {!isLoadingModel && !modelLoaded && (
              <div className="error-status">
                <p>❌ Unable to load AI model</p>
                <p>Please check your internet connection</p>
              </div>
            )}
            
            <div className="control-info">
              <h3>🎮 Control Method</h3>
              <div className="control-description">
                <p>📷 <strong>AI Camera Control</strong></p>
                <p>Use hand gestures to control the motorcycle:</p>
                <ul>
                  <li>Move hand <strong>LEFT</strong> → Motorcycle moves left</li>
                  <li>Move hand <strong>RIGHT</strong> → Motorcycle moves right</li>
                  <li>Keep hand <strong>CENTER</strong> → Stay in current lane</li>
                </ul>
              </div>
            </div>

            <div className="game-info">
              <h3>How to Play</h3>
              <div className="instructions">
                <p>🏁 Avoid obstacles by switching lanes</p>
                <p>🎯 Move left/right to dodge cars, cones, and trucks</p>
                <p>📈 Higher score = faster speed</p>
                <p>⌨️ Use Arrow keys or A/D for movement</p>
                {gameData.controlMethod === 'camera' && (
                  <p>📷 Use hand gestures: Left/Right/Center positions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Permission Dialog */}
      {showCameraDialog && (
        <div className="camera-dialog">
          <div className="dialog-content">
            <h3>📷 Camera Permission Required</h3>
            <p>AI Camera control needs access to your webcam to detect hand gestures.</p>
            
            {cameraPermission === 'denied' && (
              <div className="error-message">
                <p>❌ Camera permission was denied.</p>
                <p>Camera control is required to play this game.</p>
              </div>
            )}
            
            <div className="dialog-buttons">
              <button
                className="menu-btn"
                onClick={() => setShowCameraDialog(false)}
              >
                Cancel
              </button>
              <button
                className="menu-btn primary"
                onClick={handleCameraPermission}
                disabled={cameraPermission === 'denied'}
              >
                Allow Camera Access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
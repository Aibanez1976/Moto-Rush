import { useGameStore } from '../store/gameStore'
import { CVController } from './CVController'
import { useState, useEffect } from 'react'

export function GameUI() {
  const { gameState, stats, setGameState } = useGameStore()
  console.log('GameUI - Current gameState:', gameState)

  if (gameState === 'menu') {
    return <MainMenu />
  }

  if (gameState === 'gameOver') {
    return <GameOverScreen />
  }

  if (gameState === 'upgrades') {
    return <UpgradeScreen />
  }

  return null
}

export function GameHUD() {
  const { stats, motorcycle, powerUps, cvControlEnabled, setGameState } = useGameStore()
  const [cvError, setCvError] = useState(false)
  // Preserve camera stream across renders
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [showCameraControls, setShowCameraControls] = useState(false)
  const [modelReady, setModelReady] = useState(false)

  // Get the camera stream from global state or a new request
  useEffect(() => {
    // Check if stream already exists
    if (cameraStream) return;
    
    // If not, try to get a new stream
    const getStream = async () => {
      try {
        // Check if we already have a video element with the stream
        const existingVideo = document.querySelector('video#game-camera') as HTMLVideoElement;
        if (existingVideo && existingVideo.srcObject) {
          // Use the existing stream
          setCameraStream(existingVideo.srcObject as MediaStream);
          return;
        }
        
        // If no existing stream, request permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(stream);
        setShowCameraControls(true); // Show camera controls after permission is granted
      } catch (error) {
        console.error('Error accessing camera in GameHUD:', error);
        setCvError(true);
      }
    };
    
    if (cvControlEnabled) {
      getStream();
    }
    
    // Cleanup on unmount
    return () => {
      // Don't stop the stream here as we want to keep it for game session
      // It will be stopped when leaving the game
    };
  }, [cvControlEnabled, cameraStream]);

  // Track if the model is ready
  useEffect(() => {
    // Add event listener to track model loading
    const handleModelReady = () => {
      setModelReady(true);
    };
    
    // Listen for custom event
    window.addEventListener('tf-model-ready', handleModelReady);
    
    return () => {
      window.removeEventListener('tf-model-ready', handleModelReady);
    };
  }, []);

  const handleCVPrediction = (prediction: string) => {
    // Prediction is handled by GameController via store
  }

  const handleCVError = () => {
    console.log('CV Error detected, switching to keyboard mode')
    setCvError(true)
  }

  const handleReturnToMenu = () => {
    // Stop the camera stream before returning to menu
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setGameState('menu')
  }

  const handleStartGame = () => {
    setGameState('playing');
  };

  return (
    <div className="game-hud">
      {/* Top HUD */}
      <div className="hud-top">
        <div className="hud-item">
          <span className="hud-label">Speed</span>
          <div className="speedometer">
            <div
              className="speed-needle"
              style={{ transform: `rotate(${(motorcycle.speed / 50) * 180}deg)` }}
            />
            <span className="speed-value">{Math.round(motorcycle.speed)}</span>
          </div>
        </div>
        
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{stats.score.toLocaleString()}</span>
        </div>
        
        <div className="hud-item">
          <span className="hud-label">Coins</span>
          <span className="hud-value">{stats.coins}</span>
        </div>
        
        <div className="hud-item">
          <span className="hud-label">Distance</span>
          <span className="hud-value">{Math.round(stats.distance)}m</span>
        </div>
      </div>

      {/* Lives */}
      <div className="lives-container">
        {Array.from({ length: stats.lives }, (_, i) => (
          <span key={i} className="life">❤️</span>
        ))}
      </div>

      {/* Health Bar */}
      <div className="health-bar">
        <div
          className="health-fill"
          style={{ width: `${motorcycle.health}%` }}
        />
        <span className="health-text">HP: {motorcycle.health}%</span>
      </div>

      {/* Power-up indicators */}
      <div className="powerup-indicators">
        {Object.entries(powerUps).map(([key, powerUp]) => (
          powerUp.active && (
            <div key={key} className="powerup-indicator">
              <div
                className="powerup-timer"
                style={{
                  width: `${(powerUp.duration / 10000) * 100}%`,
                  animationDuration: `${powerUp.duration}ms`
                }}
              />
              <span className="powerup-icon">
                {key === 'shield' && '🛡️'}
                {key === 'turbo' && '⚡'}
                {key === 'magnet' && '🧲'}
              </span>
            </div>
          )
        ))}
      </div>

      {/* CV Controller removed - now handled in GameHUD */}
      
      {cvError && (
        <div className="cv-fallback-message">
          <p>Camera control not available. Using keyboard controls.</p>
        </div>
      )}
      
      {/* Game controls overlay */}
      <div className="game-controls">
        <button
          className="menu-btn"
          onClick={() => setGameState('menu')}
        >
          🏠 Main Menu
        </button>
      </div>
    </div>
  )
}

function MainMenu() {
  const { setGameState, setDifficulty, difficulty, cvControlEnabled, toggleCVControl } = useGameStore()
  const [cvSwitching, setCvSwitching] = useState(false)
  const [showCameraDialog, setShowCameraDialog] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const handleStartGame = async () => {
    if (cvControlEnabled) {
      // If AI Camera is selected, show permission dialog
      setShowCameraDialog(true)
      // Don't request permission automatically - let the user click the button
    } else {
      // If keyboard control is selected, start game directly
      setGameState('playing')
    }
  }
  
  const handleRequestCameraPermission = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      // If permission granted, stop the stream and continue
      setPermissionGranted(true)
      setPermissionDenied(false)
      setShowCameraDialog(false)
      
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop())
      
      // Start the game
      setGameState('playing')
    } catch (error) {
      console.error('Camera permission denied:', error)
      setPermissionGranted(false)
      setPermissionDenied(true)
    }
  }

  const handlePlayWithoutCamera = () => {
    // Switch to keyboard control and start game
    if (cvControlEnabled) {
      toggleCVControl()
    }
    setPermissionGranted(false)
    setPermissionDenied(false)
    setShowCameraDialog(false)
    setGameState('playing')
  }

  const handleRetryCamera = () => {
    setPermissionDenied(false)
    handleStartGame()
  }

  return (
    <>
      <div className="main-menu">
        <div className="menu-content">
          <h1>🏍️ MOTO RUSH</h1>
          <div className="menu-buttons">
            <button
              className="menu-btn primary"
              onClick={handleStartGame}
            >
              START GAME
            </button>
            
            <div className="difficulty-selector">
              <h3>Difficulty</h3>
              <div className="difficulty-buttons">
                {['easy', 'normal', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    className={`menu-btn ${difficulty === diff ? 'active' : ''}`}
                    onClick={() => setDifficulty(diff as any)}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="cv-control-selector">
              <h3>Control Method</h3>
              <div className="control-buttons">
                <button
                  className={`menu-btn ${!cvControlEnabled ? 'active' : ''}`}
                  onClick={() => {
                    if (cvControlEnabled && !cvSwitching) {
                      setCvSwitching(true)
                      toggleCVControl()
                      setTimeout(() => setCvSwitching(false), 1000)
                    } else {
                      toggleCVControl()
                    }
                  }}
                  disabled={cvSwitching}
                >
                  ⌨️ KEYBOARD
                </button>
                <button
                  className={`menu-btn ${cvControlEnabled ? 'active' : ''}`}
                  onClick={() => {
                    if (!cvControlEnabled && !cvSwitching) {
                      setCvSwitching(true)
                      toggleCVControl()
                      setTimeout(() => setCvSwitching(false), 1000)
                    } else {
                      toggleCVControl()
                    }
                  }}
                  disabled={cvSwitching}
                >
                  🤖 AI CAMERA {cvSwitching ? '(Switching...)' : ''}
                </button>
              </div>
              {cvControlEnabled && (
                <div className="cv-warning">
                  <p>⚠️ AI Camera control requires camera permission</p>
                  <p>Click START GAME to begin. If camera access fails, you can continue with keyboard controls.</p>
                </div>
              )}
            </div>
            
            <button
              className="menu-btn"
              onClick={() => setGameState('upgrades')}
            >
              UPGRADES
            </button>
          </div>
        </div>
      </div>
      
      {/* Camera Permission Dialog */}
      {showCameraDialog && (
        <div className="camera-dialog">
          <div className="camera-dialog-content">
            <h3>📷 Camera Permission Required</h3>
            <p>To use the AI Camera control feature, we need access to your webcam.</p>
            
            <div className="browser-instructions">
              <h4>How to grant camera permission:</h4>
              <ul>
                <li>Your browser will show a permission dialog</li>
                <li>Click "Allow" or "Allow camera access"</li>
                <li>If the dialog doesn't appear, check your browser's address bar for a camera icon</li>
                <li>Click on that icon and select "Allow"</li>
              </ul>
            </div>
            
            {permissionDenied && (
              <div className="permission-denied">
                <p>⚠️ Camera permission was denied.</p>
                <p>Would you like to try again or play with keyboard controls?</p>
              </div>
            )}
            
            <div className="camera-dialog-buttons">
              {permissionDenied ? (
                <>
                  <button className="menu-btn primary" onClick={handleRetryCamera}>
                    Try Again
                  </button>
                  <button className="menu-btn" onClick={handlePlayWithoutCamera}>
                    Continue with Keyboard
                  </button>
                </>
              ) : (
                <>
                  <button className="menu-btn" onClick={handlePlayWithoutCamera}>
                    Use Keyboard Controls
                  </button>
                  <button className="menu-btn primary" onClick={handleRequestCameraPermission}>
                    Allow Camera Access
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function GameOverScreen() {
  const { stats, setGameState, resetGame } = useGameStore()

  return (
    <div className="game-over">
      <div className="game-over-content">
        <h1>GAME OVER</h1>
        <div className="final-stats">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value">{stats.score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Distance</span>
            <span className="stat-value">{Math.round(stats.distance)}m</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Coins Earned</span>
            <span className="stat-value">{stats.coins}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level Reached</span>
            <span className="stat-value">{stats.level}</span>
          </div>
        </div>
        
        <div className="game-over-buttons">
          <button 
            className="menu-btn primary" 
            onClick={() => {
              resetGame()
              setGameState('playing')
            }}
          >
            PLAY AGAIN
          </button>
          <button 
            className="menu-btn" 
            onClick={() => setGameState('upgrades')}
          >
            UPGRADES
          </button>
          <button 
            className="menu-btn" 
            onClick={() => setGameState('menu')}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  )
}

function UpgradeScreen() {
  const { motorcycle, stats, setGameState, updateMotorcycle } = useGameStore()

  const upgradeCosts = {
    engine: { current: motorcycle.upgrades.engine * 100, next: (motorcycle.upgrades.engine + 1) * 100 },
    handling: { current: motorcycle.upgrades.handling * 50, next: (motorcycle.upgrades.handling + 1) * 50 },
    durability: { current: motorcycle.upgrades.durability * 75, next: (motorcycle.upgrades.durability + 1) * 75 }
  }

  const canAfford = (cost: number) => stats.coins >= cost

  const handleUpgrade = (type: 'engine' | 'handling' | 'durability') => {
    const cost = upgradeCosts[type].next
    if (canAfford(cost) && motorcycle.upgrades[type] < 10) {
      updateMotorcycle({
        upgrades: {
          ...motorcycle.upgrades,
          [type]: motorcycle.upgrades[type] + 1
        }
      })
    }
  }

  return (
    <div className="upgrade-screen">
      <div className="upgrade-content">
        <h1>🛠️ UPGRADES</h1>
        
        <div className="coins-display">
          <span className="coins-label">Coins:</span>
          <span className="coins-value">{stats.coins}</span>
        </div>
        
        <div className="upgrades-grid">
          {Object.entries(upgradeCosts).map(([type, costs]) => (
            <div key={type} className="upgrade-card">
              <h3>{type.toUpperCase()}</h3>
              <div className="upgrade-level">
                Level: {motorcycle.upgrades[type as keyof typeof motorcycle.upgrades]}
              </div>
              <div className="upgrade-stats">
                {type === 'engine' && (
                  <>
                    <div>+{(motorcycle.upgrades.engine * 2)} Max Speed</div>
                    <div>+{(motorcycle.upgrades.engine * 5)} Acceleration</div>
                  </>
                )}
                {type === 'handling' && (
                  <>
                    <div>+{(motorcycle.upgrades.handling * 10)} Turn Speed</div>
                    <div>+{(motorcycle.upgrades.handling * 5)} Control</div>
                  </>
                )}
                {type === 'durability' && (
                  <>
                    <div>+{(motorcycle.upgrades.durability * 10)} Max Health</div>
                    <div>+{(motorcycle.upgrades.durability * 5)} Armor</div>
                  </>
                )}
              </div>
              
              {motorcycle.upgrades[type as keyof typeof motorcycle.upgrades] < 10 ? (
                <button
                  className={`upgrade-btn ${canAfford(costs.next) ? '' : 'disabled'}`}
                  onClick={() => handleUpgrade(type as any)}
                  disabled={!canAfford(costs.next)}
                >
                  Upgrade ({costs.next} coins)
                </button>
              ) : (
                <div className="max-level">MAX LEVEL</div>
              )}
            </div>
          ))}
        </div>
        
        <div className="upgrade-buttons">
          <button className="menu-btn primary" onClick={() => setGameState('menu')}>
            BACK TO MENU
          </button>
          <button className="menu-btn" onClick={() => setGameState('playing')}>
            START GAME
          </button>
        </div>
      </div>
    </div>
  )
}
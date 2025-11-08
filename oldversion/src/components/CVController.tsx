import { useRef, useEffect, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'

interface CVControllerProps {
  enabled: boolean
  onPrediction: (prediction: string) => void
  onReturnToMenu: () => void
  cameraStream?: MediaStream | null
}

export function CVController({ enabled, onPrediction, onReturnToMenu, cameraStream }: CVControllerProps) {
  const [model, setModel] = useState<tf.GraphModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelError, setModelError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [prediction, setPrediction] = useState('Centro')
  const [confidence, setConfidence] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [canStartGame, setCanStartGame] = useState(false)

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        setModelError(null)
        
        // Try to load from environment variable first
        const modelUrl = import.meta.env.VITE_TEACHABLE_MACHINE_MODEL_URL
        
        // If no URL is provided, use the fallback
        const fallbackUrl = 'https://teachablemachine.withgoogle.com/models/v_c1Bmya9/model.json'
        const url = modelUrl || fallbackUrl
        
        console.log('Loading TensorFlow model from:', url)
        
        // Add timestamp to prevent caching
        const modelWithTimestamp = `${url}?v=${Date.now()}`
        
        const loadedModel = await tf.loadGraphModel(modelWithTimestamp)
        setModel(loadedModel)
        setIsLoading(false)
        setCanStartGame(true) // Allow starting the game when model is loaded
      } catch (error) {
        console.error('Error loading CV model:', error)
        setModelError('Failed to load the AI model. You can still play with keyboard controls.')
        setIsLoading(false)
        // Even if the model fails, allow the user to start the game with keyboard controls
        setCanStartGame(true)
      }
    }

    loadModel()
  }, [])

  const predictLoop = useCallback(async () => {
    // Only run prediction loop when the game is actually playing and we have a model and camera
    if (!enabled || !videoRef.current || !canvasRef.current || !model || !cameraReady) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Process the frame through TensorFlow
      const input = tf.browser.fromPixels(canvas)
      const resized = tf.image.resizeBilinear(input, [224, 224])
      const normalized = resized.div(255.0)
      const batched = normalized.expandDims(0)

      // Make prediction
      const predictionTensor = await model.predict(batched) as tf.Tensor
      const scores = await predictionTensor.data()
         
      // Get the class with highest probability
      const classes = ['Centro', 'Derecha', 'Izquierda'] // In order from Teachable Machine
      const maxScoreIndex = scores.indexOf(Math.max(...scores))
      const maxScore = Math.max(...scores)
      const predictedClass = classes[maxScoreIndex]

      setPrediction(predictedClass)
      setConfidence(maxScore)

      // Emit prediction to parent component for game logic
      if (maxScore > 0.7) {
        onPrediction(predictedClass)
      }

      // Clean up tensors
      tf.dispose([input, resized, normalized, batched, predictionTensor])

    } catch (error) {
      console.error('Prediction error:', error)
    }

    // Continue the loop
    if (enabled && videoRef.current && canvasRef.current && model && cameraReady) {
      animationFrameRef.current = requestAnimationFrame(predictLoop)
    }
  }, [enabled, model, onPrediction, cameraReady])

  useEffect(() => {
    if (!enabled || !model || !videoRef.current || !canvasRef.current) return

    // If we have a stream from the parent, use it directly
    if (cameraStream) {
      setPermissionRequested(true)
      setCameraError(null)
      setPermissionDenied(false)
        
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera started successfully')
          setCameraReady(true)
          videoRef.current?.play()
          predictLoop()
        }
      }
    } else {
      // Otherwise, request a new stream
      const startCamera = async () => {
        try {
          // Mark that we've requested permission
          setPermissionRequested(true)
          console.log('Requesting camera access...')
          
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
          })
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = () => {
              console.log('Camera started successfully')
              setCameraReady(true)
              videoRef.current?.play()
              predictLoop()
            }
          }
        } catch (error) {
          console.error('Error accessing camera:', error)
          setCameraError(error instanceof Error ? error.message : 'Unknown camera error')
          
          // Check if this is a permission error
          if (error instanceof Error &&
              (error.name === 'NotAllowedError' ||
               error.name === 'SecurityError' ||
               error.name === 'NotFoundError')) {
            setPermissionDenied(true)
          }
        }
      }

      startCamera()
    }
  }, [enabled, model, predictLoop, cameraStream])

  useEffect(() => {
    if (!enabled) {
      // Stop prediction loop when disabled
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } else if (enabled && model && videoRef.current && canvasRef.current && cameraReady) {
      // Restart prediction loop when enabled
      predictLoop()
    }
  }, [enabled, model, predictLoop, cameraReady])

  useEffect(() => {
    return () => {
      // Cleanup prediction loop when component unmounts
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Note: We don't stop the camera stream here as it's managed by the parent component
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="cv-controller">
      <div className="cv-controls">
        <h3>🤖 CV Control Mode</h3>
        
        {isLoading ? (
          <div className="cv-loading">
            <div className="loading-spinner"></div>
            <span>Loading AI Model...</span>
          </div>
        ) : (
          <div className="cv-status">
            {permissionRequested && !permissionDenied && !cameraReady ? (
              <div className="cv-permission-request">
                <div className="permission-icon">📷</div>
                <h4>Camera Access Request</h4>
                <p>To use AI Camera control, we need access to your webcam.</p>
                <p>You can control the motorcycle by moving your hands left or right in front of the camera.</p>
                <p className="grant-permission">Please grant permission in your browser to continue.</p>
                <div className="button-row">
                  <button className="menu-btn" onClick={onReturnToMenu}>
                    Back to Main Menu
                  </button>
                </div>
              </div>
            ) : cameraError && permissionDenied ? (
              <div className="cv-error">
                <div className="error-icon">⚠️</div>
                <h4>Camera Permission Denied</h4>
                <p>Camera permission was denied. Please allow camera access in your browser settings.</p>
                <p>You can try again later by switching to AI Camera control in the main menu.</p>
                <div className="button-row">
                  <button className="menu-btn" onClick={onReturnToMenu}>
                    Return to Main Menu
                  </button>
                </div>
              </div>
            ) : cameraError ? (
              <div className="cv-error">
                <div className="error-icon">⚠️</div>
                <h4>Camera Access Error</h4>
                <p>Unable to access camera. Please check your camera and browser settings.</p>
                <p>The game will continue with keyboard controls.</p>
                <div className="button-row">
                  <button className="menu-btn" onClick={onReturnToMenu}>
                    Return to Main Menu
                  </button>
                </div>
              </div>
            ) : (
              <>
                {modelError ? (
                  <div className="model-error">
                    <p>{modelError}</p>
                  </div>
                ) : null}
                
                {!cameraReady ? (
                  <div className="camera-status">
                    <div className="camera-icon">📷</div>
                    <h4>Camera Initializing</h4>
                    <p>Setting up camera access...</p>
                  </div>
                ) : canStartGame ? (
                  <div className="start-game">
                    <div className="ready-icon">✅</div>
                    <h4>Ready to Play</h4>
                    <p>Camera and AI model are ready!</p>
                    <p>Click START GAME when you're ready to begin.</p>
                    <div className="button-row">
                      <button className="menu-btn primary" onClick={onReturnToMenu}>
                        START GAME
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prediction-display">
                      <span className="prediction-text">{prediction}</span>
                      <span className="confidence-text">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="prediction-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    
                    <div className="instructions">
                      <div className={`instruction ${prediction === 'Izquierda' ? 'active' : ''}`}>
                        ⬅️ Move Left
                      </div>
                      <div className={`instruction ${prediction === 'Centro' ? 'active' : ''}`}>
                        ⬆️ Stay Center
                      </div>
                      <div className={`instruction ${prediction === 'Derecha' ? 'active' : ''}`}>
                        ➡️ Move Right
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
        
        <video
          ref={videoRef}
          className="cv-video"
          width={200}
          height={150}
          muted
          playsInline
          autoPlay
          style={{ display: enabled && cameraReady ? 'block' : 'none' }}
        />
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {cameraReady && (
          <div className="cv-tips">
            <p>💡 <strong>Tips:</strong></p>
            <ul>
              <li>Make sure you're well-lit</li>
              <li>Keep your hands visible in the camera</li>
              <li>Move your hand to the left/right for control</li>
              <li>Keep hand steady in center to maintain position</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
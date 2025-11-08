import React, { useRef, useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import { useGame } from '../store/gameContext'

export function CVController() {
  const { dispatch } = useGame()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<string>('Centro')
  const [confidence, setConfidence] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const modelRef = useRef<tf.LayersModel | null>(null)
  const lastPredictionRef = useRef<string>('Centro')
  const predictionCounterRef = useRef<number>(0)

  const modelUrl = 'https://teachablemachine.withgoogle.com/models/qjZp5Ulg9/model.json'

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('🔄 Loading model from:', modelUrl)
        const loadedModel = await tf.loadLayersModel(modelUrl)
        modelRef.current = loadedModel
        setModel(loadedModel)
        setIsLoading(false)
        console.log('✅ Model loaded successfully')
      } catch (err) {
        console.error('❌ Error loading model:', err)
        setError('Failed to load model')
        setIsLoading(false)
      }
    }

    loadModel()
  }, [])

  // Start camera and prediction loop
  useEffect(() => {
    const startCamera = async () => {
      try {
        console.log('📷 Requesting camera access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'  // Use front camera
          }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          console.log('✅ Camera started successfully')

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('📹 Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          }

          videoRef.current.oncanplay = () => {
            console.log('🎬 Video can play, starting predictions')
          }
        }
      } catch (err) {
        console.error('❌ Camera access failed:', err)
        setError('Camera access denied')
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
        console.log('📷 Camera stopped')
      }
    }
  }, [])

  // Prediction loop - runs continuously when model is ready - ULTRA FAST
  useEffect(() => {
    if (!model) return

    let isRunning = true

    const predict = async () => {
      if (!isRunning) return

      try {
        if (!videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) {
          if (isRunning) {
            setTimeout(predict, 16) // ~60fps fallback
          }
          return
        }

        const startTime = performance.now()

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const input = tf.browser.fromPixels(canvas)
        const resized = tf.image.resizeBilinear(input, [224, 224])
        const normalized = resized.div(255.0)
        const batched = normalized.expandDims(0)

        const predictions = await modelRef.current!.predict(batched) as tf.Tensor
        const scores = await predictions.data()

        const classes = ['Centro', 'Izquierda', 'Derecha']
        const scoresArray = Array.from(scores)
        const maxScoreIndex = scoresArray.indexOf(Math.max(...scoresArray))
        const maxScore = Math.max(...scoresArray)
        const predictedClass = classes[maxScoreIndex]

        setPrediction(predictedClass)
        setConfidence(maxScore)

        const endTime = performance.now()
        const latency = endTime - startTime

        // NEW CONTROL LOGIC: Direct lane positioning based on prediction
        // Centro = Center lane (lane 1), Izquierda = Left lane (lane 0), Derecha = Right lane (lane 2)
        console.log(`🎯 Prediction: ${predictedClass} (${(maxScore * 100).toFixed(1)}%) - Latency: ${latency.toFixed(1)}ms`)

        if (maxScore > 0.6) { // Lower threshold for responsiveness
          let targetLane = 1 // Default to center

          if (predictedClass === 'Centro') {
            targetLane = 1 // Center lane
          } else if (predictedClass === 'Izquierda') {
            targetLane = 0 // Left lane
          } else if (predictedClass === 'Derecha') {
            targetLane = 2 // Right lane
          }

          // Always dispatch to move to the target lane (no change detection needed)
          console.log(`🎯 MOVING TO LANE: ${targetLane} (${predictedClass})`)
          dispatch({ type: 'SET_MOTORCYCLE_LANE', payload: targetLane })
        } else {
          console.log(`⚠️ LOW CONFIDENCE: ${predictedClass} (${(maxScore * 100).toFixed(1)}%) - IGNORING`)
        }

        tf.dispose([input, resized, normalized, batched, predictions])

      } catch (err) {
        console.error('❌ Prediction error:', err)
      }

      // Ultra-fast loop - no requestAnimationFrame delay
      if (isRunning) {
        setTimeout(predict, 1) // Minimal delay for maximum responsiveness
      }
    }

    predict() // Start immediately

    return () => {
      isRunning = false
    }
  }, [model, dispatch])

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #4ecdc4',
        color: '#4ecdc4',
        zIndex: 1000,
        fontWeight: 'bold'
      }}>
        ⏳ Loading AI Model...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #ff6b6b',
        color: '#ff6b6b',
        zIndex: 1000,
        fontWeight: 'bold'
      }}>
        ❌ {error}
      </div>
    )
  }

  return (
    <div className="cv-controller">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '320px',  // Increased size for better visibility
          height: '240px', // Increased size for better visibility
          borderRadius: '8px',
          border: '3px solid #4ecdc4',
          zIndex: 1000,
          objectFit: 'cover',
          transform: 'scaleX(-1)'  // Mirror the video for natural feel
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      <div className="ai-predictions" style={{
        position: 'fixed',
        top: '270px',  // Adjusted for larger video
        right: '20px',
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        border: '3px solid #4ecdc4',
        color: 'white',
        zIndex: 1000,
        minWidth: '320px',  // Wider for larger video
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '16px', fontWeight: 'bold' }}>🤖 AI Vision Control</h4>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '6px', fontWeight: '500' }}>Live Prediction:</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: confidence > 0.8 ? '#4ecdc4' : confidence > 0.6 ? '#ff9800' : '#ff6b6b',
            letterSpacing: '2px',
            textShadow: confidence > 0.8 ? '0 0 8px rgba(78, 205, 196, 0.3)' : 'none',
            background: confidence > 0.8 ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: `2px solid ${confidence > 0.8 ? '#4ecdc4' : confidence > 0.6 ? '#ff9800' : '#ff6b6b'}`,
            opacity: confidence > 0.8 ? 1 : 0.7
          }}>
            {prediction}
            {confidence <= 0.8 && <span style={{ fontSize: '14px', marginLeft: '8px', opacity: 0.7 }}>⚠️</span>}
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '6px', fontWeight: '500' }}>Confidence Level:</div>
          <div style={{ background: '#1a1a1a', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '6px 0', border: '2px solid #333' }}>
            <div style={{
              width: `${confidence * 100}%`,
              height: '100%',
              background: confidence > 0.8 ? '#4ecdc4' : confidence > 0.6 ? '#ff9800' : '#ff6b6b',
              transition: 'width 0.2s ease',
              boxShadow: confidence > 0.8 ? `0 0 10px #4ecdc4` : 'none'
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: confidence > 0.8 ? '#4ecdc4' : confidence > 0.6 ? '#ff9800' : '#ff6b6b',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {Math.round(confidence * 100)}%
            {confidence > 0.8 && <span style={{ marginLeft: '4px' }}>✅</span>}
            {confidence <= 0.6 && <span style={{ marginLeft: '4px' }}>❌</span>}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#888', borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px' }}>
          <div style={{ marginBottom: '4px' }}>🎯 Model: Teachable Machine</div>
          <div>📊 Classes: Centro | Izquierda | Derecha</div>
        </div>
      </div>
    </div>
  )
}

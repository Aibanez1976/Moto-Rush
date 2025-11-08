import React from 'react'
import { GameProvider } from './store/gameContext'
import { GameContainer } from './components/GameContainer'
import './App.css'

function App() {
  return (
    <div className="game-container">
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </div>
  )
}

export default App

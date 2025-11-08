# 🏍️ MOTO RUSH - Game Development Guide

## Project Overview

**Moto Rush** is a high-octane 3D motorcycle arcade racing game built with React, Three.js, and TypeScript. Inspired by classic endless runners and Road Rash, it combines fast-paced gameplay with cutting-edge computer vision controls.

### 🎮 Core Features

#### Gameplay Mechanics
- **Three-Lane System**: Navigate left, center, or right lanes to avoid obstacles
- **Infinite Road**: Procedurally generated road that scrolls infinitely
- **Progressive Difficulty**: Speed and obstacle density increase with each level
- **Dynamic Scoring**: Earn points by surviving, collecting coins, and avoiding obstacles
- **Health System**: Take damage from collisions, regenerate slowly over time

#### Obstacles
- **Cars** (Red): Standard vehicles that block your path
- **Trucks** (Blue): Larger obstacles requiring more space to avoid
- **Cones** (Orange): Traffic cones marking hazards
- **Potholes** (Brown): Road damage that damages your motorcycle

#### Power-ups
- **🛡️ Shield**: Absorbs one collision without taking damage (10 seconds)
- **⚡ Turbo**: Boosts speed and creates visual effects (5 seconds)
- **🧲 Magnet**: Automatically collects nearby coins (15 seconds)

#### Control Systems
1. **Keyboard Controls** (Default)
   - `Arrow Left` or `A`: Move to left lane
   - `Arrow Right` or `D`: Move to right lane

2. **Mobile Touch Controls**
   - Swipe left to move left
   - Swipe right to move right
   - Minimum swipe distance: 50px

3. **AI Camera Control** (Computer Vision)
   - Uses Google Teachable Machine for hand gesture recognition
   - Gestures: Left hand, Center, Right hand
   - Real-time webcam processing with TensorFlow.js

#### Game Modes
- **Easy**: 0.8x speed multiplier, slower difficulty scaling
- **Normal**: 1x speed multiplier, balanced progression
- **Hard**: 1.2x speed multiplier, aggressive difficulty scaling

#### Visual Features
- **Day/Night Modes**: Dynamic lighting system
  - Day: Warm colors, relaxed atmosphere
  - Night: Neon lights, intense atmosphere
- **Particle Effects**: Dust clouds, turbo sparks, collision effects
- **Smooth Animations**: Lane transitions, camera follow, UI animations
- **3D Motorcycle Model**: Customizable with upgrade effects

#### Upgrade System
Players earn coins to upgrade their motorcycle:
- **Engine**: Increases max speed and acceleration
- **Handling**: Improves turn speed and control
- **Durability**: Increases max health and armor

---

## 🏗️ Project Architecture

### Directory Structure
```
moto-rush/
├── src/
│   ├── components/
│   │   ├── Camera.tsx              # Third-person camera system
│   │   ├── Lighting.tsx            # Day/night lighting
│   │   ├── Road.tsx                # Infinite road generation
│   │   ├── Motorcycle.tsx          # Player motorcycle model
│   │   ├── Obstacles.tsx           # Obstacle spawning & collision
│   │   ├── PowerUps.tsx            # Power-up system
│   │   ├── ParticleSystem.tsx      # Visual effects
│   │   ├── GameScene.tsx           # Main 3D scene
│   │   ├── GameUI.tsx              # UI screens (menu, HUD, etc)
│   │   ├── GameController.tsx      # Game logic & input handling
│   │   └── CVController.tsx        # Computer vision integration
│   ├── store/
│   │   └── gameStore.ts            # Zustand state management
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # Global styles
│   └── main.tsx                    # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

### State Management (Zustand)

The game uses Zustand for centralized state management:

```typescript
interface GameStore {
  // Game state
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver' | 'upgrades'
  isDayMode: boolean
  
  // Motorcycle data
  motorcycle: {
    position: [x, y, z]
    lane: 0 | 1 | 2
    speed: number
    health: number
    damage: number
    upgrades: { engine, handling, durability }
  }
  
  // Game statistics
  stats: {
    score: number
    coins: number
    distance: number
    level: number
    lives: number
  }
  
  // Power-ups
  powerUps: {
    shield: { active, duration }
    turbo: { active, duration }
    magnet: { active, duration }
  }
  
  // Computer Vision
  cvControlEnabled: boolean
  cvPrediction: 'Centro' | 'Izquierda' | 'Derecha'
  cvConfidence: number
}
```

### Component Hierarchy

```
App
├── GameUI (Menu/HUD/GameOver/Upgrades)
└── Canvas (Three.js)
    └── GameScene
        ├── GameController (Logic)
        ├── Camera (Third-person)
        ├── Lighting (Day/Night)
        ├── Road (Infinite scrolling)
        ├── Motorcycle (Player model)
        ├── Obstacles (Collision detection)
        ├── PowerUps (Collection system)
        ├── ParticleSystem (Visual effects)
        └── Environment (Sky, trees, etc)
```

---

## 🎯 Game Flow

### Main Menu
1. Select difficulty (Easy/Normal/Hard)
2. Choose control method (Keyboard/AI Camera)
3. Start game or access upgrades

### Gameplay Loop
1. **Initialization**: Spawn motorcycle at center lane
2. **Update Loop** (60 FPS):
   - Process input (keyboard/touch/CV)
   - Update motorcycle position
   - Move obstacles and power-ups
   - Check collisions
   - Update camera and lighting
   - Render particles
3. **Collision Detection**:
   - Obstacle hit: Take damage or activate shield
   - Power-up collected: Activate effect and earn coins
4. **Game Over**: When lives reach 0

### Progression System
- **Distance-based Levels**: Every 500m increases level
- **Speed Scaling**: Base speed + (level × 2) + upgrades
- **Difficulty Scaling**: Obstacle density increases with level
- **Coin Rewards**: Collect coins to upgrade motorcycle

---

## 🛠️ Technical Stack

### Frontend Framework
- **React 19**: UI and component management
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

### 3D Graphics
- **Three.js**: 3D rendering engine
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Useful Three.js utilities

### State Management
- **Zustand**: Lightweight state management

### AI/ML
- **TensorFlow.js**: Machine learning in browser
- **Google Teachable Machine**: Pre-trained hand gesture model

### Styling
- **CSS3**: Custom animations and responsive design

---

## 🚀 Getting Started

### Installation
```bash
cd moto-rush
npm install
```

### Development Server
```bash
npm run dev
```
Server runs on `http://localhost:5174`

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

---

## 🎮 How to Play

### Objective
Survive as long as possible while collecting coins and avoiding obstacles. Each level increases the challenge!

### Controls
- **Keyboard**: Arrow keys or A/D to change lanes
- **Mobile**: Swipe left/right to change lanes
- **AI Camera**: Enable in menu and use hand gestures

### Strategy Tips
1. **Anticipate Obstacles**: Look ahead and plan lane changes
2. **Collect Power-ups**: Shield protects you, Turbo boosts speed, Magnet collects coins
3. **Upgrade Wisely**: Engine for speed, Handling for control, Durability for survivability
4. **Manage Health**: Avoid unnecessary collisions to maintain health
5. **Level Up**: Reach higher levels for better rewards

---

## 📊 Game Balance

### Difficulty Multipliers
| Difficulty | Speed | Obstacle Density | Coin Reward |
|-----------|-------|------------------|------------|
| Easy      | 0.8x  | 0.8x             | 1.2x       |
| Normal    | 1.0x  | 1.0x             | 1.0x       |
| Hard      | 1.2x  | 1.2x             | 0.8x       |

### Upgrade Costs
- **Engine**: 100 × level coins
- **Handling**: 50 × level coins
- **Durability**: 75 × level coins

### Power-up Durations
- **Shield**: 10 seconds
- **Turbo**: 5 seconds
- **Magnet**: 15 seconds

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Sound effects and background music
- [ ] Leaderboard system with local storage
- [ ] Multiple motorcycle skins
- [ ] Different road environments
- [ ] Boss encounters
- [ ] Multiplayer mode
- [ ] Mobile app version
- [ ] Achievements and badges
- [ ] Replay system
- [ ] Advanced AI opponents

### Performance Optimizations
- [ ] Object pooling for obstacles
- [ ] LOD (Level of Detail) system
- [ ] Frustum culling
- [ ] WebGL optimization

---

## 🐛 Known Issues & Troubleshooting

### Issue: Game runs slowly
**Solution**: Reduce particle count or disable shadows in Lighting.tsx

### Issue: CV Control not working
**Solution**: 
1. Check webcam permissions
2. Ensure good lighting
3. Train the Teachable Machine model with your hand gestures

### Issue: Obstacles not appearing
**Solution**: Check browser console for errors, ensure Obstacles.tsx is properly imported

---

## 📝 Code Examples

### Adding a New Obstacle Type
```typescript
// In Obstacles.tsx
function NewObstacleModel() {
  return (
    <mesh castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#COLOR" />
    </mesh>
  )
}
```

### Creating a New Power-up
```typescript
// In gameStore.ts - Add to PowerUp type
export interface PowerUp {
  type: 'shield' | 'turbo' | 'magnet' | 'newPowerUp'
  duration: number
  active: boolean
}

// In PowerUps.tsx - Add model and collection logic
```

### Modifying Game Difficulty
```typescript
// In GameController.tsx
const difficultyMultiplier = difficulty === 'easy' ? 0.8 : 
                             difficulty === 'normal' ? 1 : 1.2
```

---

## 🎨 Visual Design

### Color Palette
- **Primary**: #00D9FF (Cyan)
- **Secondary**: #FF6B6B (Red)
- **Accent**: #FFD700 (Gold)
- **Dark**: #0F0F23 (Night)
- **Light**: #FFFFFF (Day)

### Typography
- **Title**: Bold, large, glowing effect
- **UI**: Clean, readable, high contrast

### Animation Principles
- **Smooth Transitions**: 0.1s lerp for lane changes
- **Responsive Feedback**: Immediate visual response to input
- **Particle Effects**: Enhance sense of speed and impact

---

## 📞 Support & Contribution

For issues, suggestions, or contributions, please refer to the project repository.

---

## 📄 License

This project is created for educational purposes.

---

**Enjoy the rush! 🏍️💨**
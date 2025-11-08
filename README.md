# Moto-Rush - Clean Architecture Version

A fast-paced motorcycle racing game built with React, TypeScript, and Three.js.

## Features

- 🏍️ **Motorcycle Racing**: Fast-paced lane-based racing action
- 🎮 **Dual Control Methods**: 
  - Keyboard controls (Arrow keys or A/D)
  - AI Camera controls (hand gestures)
- 🛣️ **Dynamic Obstacles**: Cars, cones, and trucks to dodge
- 📈 **Progressive Difficulty**: Speed and obstacles increase with level
- 💾 **Clean Architecture**: Built with modern React patterns and TypeScript
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **GitHub Pages Ready**: Optimized for deployment

## Architecture Highlights

### Clean State Management
- **React Context** instead of complex Zustand with middleware
- **Simple Actions** with clear separation of concerns
- **Predictable State Updates** with useReducer pattern

### Component Architecture
- **GameContainer**: Main game flow controller
- **MainMenu**: Clean menu with camera permission handling
- **GameScene**: 3D game world with Three.js
- **GameLogic**: Centralized game loop and mechanics
- **GameHUD**: Real-time game statistics and controls
- **CameraController**: Simplified camera access with error handling

### Fixed Issues from Previous Version
✅ **Obstacle Direction**: Obstacles now properly move towards the player (from negative to positive Z)  
✅ **Camera System**: Simplified camera access without complex permission dialogs  
✅ **State Management**: Clean React Context instead of complex Zustand setup  
✅ **Game Loop**: Centralized game logic in one component  
✅ **Error Handling**: Proper fallbacks and user feedback  

## Game Controls

### Keyboard Controls
- **Left Arrow** or **A**: Move motorcycle left
- **Right Arrow** or **D**: Move motorcycle right
- **P**: Pause/Resume game

### AI Camera Controls
- **Left Hand Position**: Move motorcycle left
- **Center Hand Position**: Stay in current lane
- **Right Hand Position**: Move motorcycle right

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd moto-rush

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is optimized for GitHub Pages deployment:

1. **Build Configuration**: Vite config includes proper base path (`/moto-rush/`)
2. **Asset Optimization**: Code splitting for vendor and Three.js libraries
3. **Responsive Design**: Works across all modern browsers

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Camera Features
- Requires HTTPS for camera access (GitHub Pages provides this)
- Fallback to keyboard controls if camera unavailable

## Project Structure

```
src/
├── components/           # React components
│   ├── GameContainer.tsx    # Main game flow
│   ├── MainMenu.tsx         # Menu and settings
│   ├── GameScene.tsx        # 3D game world
│   ├── GameLogic.tsx        # Game mechanics
│   ├── GameHUD.tsx          # Game UI
│   ├── GameCamera.tsx       # 3D camera following
│   ├── Motorcycle.tsx       # Player motorcycle
│   ├── Road.tsx            # Race track
│   ├── Obstacles.tsx       # Obstacle rendering
│   └── CameraController.tsx # Camera access
├── store/
│   └── gameContext.tsx     # State management
├── App.tsx               # Root component
├── App.css              # Styling
└── main.tsx             # Entry point
```

## Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Modern React**: Hooks and functional components
- **Clean Architecture**: Separation of concerns

### Performance
- **Code Splitting**: Automatic vendor chunking
- **Efficient Rendering**: Optimized Three.js usage
- **Memory Management**: Proper cleanup of camera streams

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Credits

Built with:
- [React](https://reactjs.org/)
- [Three.js](https://threejs.org/)
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

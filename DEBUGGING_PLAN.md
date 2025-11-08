# Moto-Rush Game State Debugging Plan

## Issue Description
The `gameState` in the Zustand store does not update from 'menu' to 'playing' when the "START GAME" button is clicked, preventing the game scene from rendering.

## Current State of Debugging

### 1. Changes Made
- Fixed syntax errors in `gameStore.ts` file
- Updated the Zustand store implementation to properly use the `subscribeWithSelector` middleware in Zustand v5
- Added detailed logging to track gameState changes both in the store and in the App component
- Added a subscription in App.tsx to monitor gameState changes

### 2. Key Files Modified
- `moto-rush/src/store/gameStore.ts`: Store implementation with improved Zustand v5 usage
- `moto-rush/src/App.tsx`: Added subscription for gameState changes

## Debugging Steps to Continue

### Step 1: Test Current Implementation
1. Go to http://localhost:5175
2. Open browser developer console (F12)
3. Click "START GAME" button
4. Check console logs for:
   - "App - Current gameState:" messages
   - "App subscription - gameState changed to:" messages
   - "setGameState called with:" messages
   - "setGameState" function execution results

### Step 2: Analyze Console Logs

#### If `setGameState` is being called but state doesn't update:
- This suggests a problem with the Zustand store implementation
- Consider using a simpler store setup without `subscribeWithSelector` middleware
- Try creating a basic store just for state management without middleware

#### If `setGameState` is not being called:
- The issue is in the MainMenu component (in GameUI.tsx)
- Verify the button's onClick handler is properly connected to setGameState

#### If state updates but Canvas doesn't render:
- The issue is with component re-rendering in App.tsx
- Check if the conditional rendering `{gameState === 'playing' && <Canvas>...}` is working correctly

### Step 3: Implement Testing Framework
Create a simple test file to verify store behavior:

```typescript
import { useGameStore } from './src/store/gameStore'

// Test code to check store functionality
export function testStore() {
  const { gameState, setGameState } = useGameStore()
  console.log('Initial state:', gameState)
  
  // Manually set state and check
  setGameState('playing')
  console.log('State after manual update:', useGameStore.getState().gameState)
}
```

Call this test function from a component to verify the store is working correctly.

### Step 4: Fallback Solution
If the issue persists, consider implementing a simpler store:

```typescript
export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  gameState: 'menu',
  // ... other state properties
  
  // Simplified state setter
  setGameState: (state) => {
    console.log('Setting game state to:', state)
    set({ gameState: state })
    console.log('New state:', useGameStore.getState().gameState)
  },
  // ... other methods
}))
```

This removes the `subscribeWithSelector` middleware which might be causing issues.

## Additional Investigation Points

1. **Verify Zustand Version**: The code uses Zustand v5 with `subscribeWithSelector` middleware. Check if this is being used correctly.

2. **Component Re-rendering**: Investigate if React components are properly re-rendering when the Zustand state changes.

3. **State Propagation**: Check if the state is being properly propagated from the store to the components.

## Current GameState Update Flow
1. MainMenu (in GameUI.tsx) calls `setGameState('playing')`
2. Zustand store updates the state
3. App.tsx should re-render when state changes
4. GameUI.tsx should re-render when state changes
5. Canvas should be rendered when gameState is 'playing'

## Next Steps
1. Run the test and check console logs
2. If still not working, implement a simpler store
3. Verify Canvas rendering works with the new implementation
4. Add additional debugging to trace the exact point of failure

## Relevant Files to Focus On
- `moto-rush/src/store/gameStore.ts` - Store implementation
- `moto-rush/src/App.tsx` - App component
- `moto-rush/src/components/GameUI.tsx` - GameUI component
import { useGameStore } from '../store/gameStore'

export function Lighting() {
  const { isDayMode } = useGameStore()

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={isDayMode ? 0.6 : 0.3} />
      
      {/* Directional light (sun/moon) */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={isDayMode ? 1.0 : 0.4}
        color={isDayMode ? '#FFFFFF' : '#4477FF'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Night-specific lights */}
      {!isDayMode && (
        <>
          {/* Road lighting */}
          <pointLight position={[0, 2, 0]} intensity={0.5} color="#FFA500" />
          
          {/* Headlight effects */}
          <spotLight
            position={[0, 2, 5]}
            angle={0.3}
            penumbra={0.5}
            intensity={1.5}
            color="#FFFFFF"
            castShadow
          />
          
          {/* Neon signs */}
          {Array.from({ length: 10 }, (_, i) => (
            <pointLight
              key={i}
              position={[-12 + (i % 3) * 12, 3, i * 30 - 150]}
              intensity={0.8}
              color={['#FF00FF', '#00FFFF', '#FFFF00'][i % 3]}
            />
          ))}
        </>
      )}
      
      {/* Day-specific lights */}
      {isDayMode && (
        <>
          {/* Additional fill light for day */}
          <directionalLight
            position={[-10, 10, -10]}
            intensity={0.5}
            color="#FFFACD"
          />
          
          {/* Sun glow */}
          <pointLight
            position={[50, 80, -50]}
            intensity={2}
            color="#FFF8DC"
          />
        </>
      )}
    </>
  )
}
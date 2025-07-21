# State Management

This document details the state management architecture using Zustand stores, explaining patterns, best practices, and implementation details.

## 🏗️ Architecture Overview

The Dual N-Back application uses **Zustand** for state management, providing a lightweight, flexible, and TypeScript-friendly solution with localStorage persistence.

```
┌─────────────────────────────────────────────────────────────────┐
│                       State Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│  React Components  →  Zustand Stores  →  localStorage           │
│                                                                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌────────────────┐   │
│  │ GameBoard   │───→│ gameStore       │───→│ Session Data   │   │
│  │ Controls    │    │ - Game State    │    │ - Temp Storage │   │
│  │ Statistics  │    │ - Responses     │    └────────────────┘   │
│  └─────────────┘    │ - Performance   │                        │
│                     └─────────────────┘                        │
│  ┌─────────────┐    ┌─────────────────┐    ┌────────────────┐   │
│  │ Settings    │───→│ settingsStore   │───→│ User Prefs     │   │
│  │ Tutorial    │    │ - Configuration │    │ - Persistent   │   │
│  └─────────────┘    │ - Preferences   │    └────────────────┘   │
│                     └─────────────────┘                        │
│  ┌─────────────┐    ┌─────────────────┐    ┌────────────────┐   │
│  │ Statistics  │───→│ statsStore      │───→│ Long-term Data │   │
│  │ Progress    │    │ - Sessions      │    │ - Persistent   │   │
│  │ Achievements│    │ - Achievements  │    └────────────────┘   │
│  └─────────────┘    └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎮 Game Store

### State Structure

```typescript
interface GameState {
  // Game Status
  isPlaying: boolean
  isPaused: boolean
  gamePhase: 'waiting' | 'stimulus' | 'response' | 'feedback' | 'completed'
  
  // Game Configuration
  nLevel: number
  totalRounds: number
  settings: GameSettings
  
  // Current Game Data
  sequence: GameSequence[]
  currentRound: number
  currentStimulusIndex: number
  responses: Response[]
  score: GameScore
  
  // Timing
  gameStartTime: number | null
  gameEndTime: number | null
  responseDeadline: number | null
  waitingForResponse: boolean
  
  // Feedback
  feedback: {
    position?: boolean
    audio?: boolean
  }
  
  // Adaptive System
  performanceHistory: PerformanceSnapshot[]
  adaptiveMode: boolean
}
```

### Actions

```typescript
interface GameActions {
  // Game Control
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  resetGame: () => void
  
  // Gameplay
  nextStimulus: () => void
  submitResponse: (type: ResponseType) => void
  submitResponseIfValid: (type: ResponseType) => void
  
  // Configuration
  setNLevel: (level: number) => void
  setTotalRounds: (rounds: number) => void
  updateSettings: (settings: Partial<GameSettings>) => void
  
  // Adaptive System
  setAdaptiveMode: (enabled: boolean) => void
  
  // Computed Values
  currentStimulus: () => GameSequence | null
}
```

### Implementation

```typescript
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...initialGameState,
  
  // Game control actions
  startGame: () => {
    const state = get()
    const difficulty = state.nLevel <= 2 ? 'easy' : state.nLevel <= 4 ? 'medium' : 'hard'
    
    // Generate sequence using adaptive algorithm if enabled
    const sequence = state.adaptiveMode 
      ? generateAdaptiveSequence(
          state.totalRounds + state.nLevel, 
          state.settings.gridSize,
          state.nLevel,
          difficulty,
          state.performanceHistory
        )
      : generateEngagingSequence(
          state.totalRounds + state.nLevel, 
          state.settings.gridSize,
          state.nLevel,
          difficulty
        )
    
    set({
      sequence,
      isPlaying: true,
      gamePhase: 'stimulus',
      gameStartTime: Date.now(),
      currentStimulusIndex: 0,
      currentRound: 0,
      responses: [],
      score: initialScore,
      feedback: {}
    })
  },
  
  // Response handling with adaptive analysis
  submitResponse: (type) => {
    const state = get()
    const { sequence, currentStimulusIndex, nLevel, score, responses } = state
    
    // Validate and score response
    const isCorrect = validateResponse(type, sequence, currentStimulusIndex, nLevel)
    const newScore = updateScore(score, type, isCorrect)
    
    // Update responses
    const newResponses = [...responses, {
      type,
      correct: isCorrect,
      responseTime: Date.now() - (state.responseDeadline || Date.now()),
      roundIndex: state.currentRound
    }]
    
    set({
      responses: newResponses,
      score: newScore,
      feedback: { [type]: isCorrect }
    })
    
    // Adaptive difficulty analysis
    if (state.adaptiveMode && newResponses.length % 5 === 0) {
      const snapshot = createPerformanceSnapshot(newResponses, 10)
      const newHistory = [...state.performanceHistory, snapshot]
      const triggers = analyzeAdaptiveTriggers(newHistory, nLevel)
      
      set({ performanceHistory: newHistory.slice(-20) })
      
      if (triggers.shouldAdjust) {
        console.log(`🧠 Adaptive AI: ${triggers.reason} (${triggers.urgency} urgency)`)
      }
    }
  }
}))
```

## 📊 Statistics Store

### State Structure

```typescript
interface StatisticsState {
  stats: Statistics
  achievements: Achievement[]
}

interface Statistics {
  sessions: GameSession[]
  totalGamesPlayed: number
  averageScore: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  totalPlayTime: number
  nLevelProgress: Record<number, NLevelStats>
}
```

### Persistence Pattern

```typescript
export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      achievements: defaultAchievements,
      
      // Add session and update statistics
      addSession: (session: GameSession) => {
        set((state) => {
          const updatedSessions = [...state.stats.sessions, session]
          const newStats = calculateStats(updatedSessions)
          
          return {
            stats: {
              ...newStats,
              sessions: updatedSessions
            }
          }
        })
        
        // Check achievements after state update
        get().updateAchievements(session)
      },
      
      // Achievement system
      updateAchievements: (newSession) => {
        const { stats, achievements } = get()
        
        const updatedAchievements = achievements.map(achievement => {
          if (!achievement.unlocked && achievement.condition) {
            const shouldUnlock = achievement.condition(stats, newSession)
            
            if (shouldUnlock) {
              return {
                ...achievement,
                unlocked: true,
                unlockedDate: Date.now()
              }
            }
          }
          return achievement
        })
        
        set({ achievements: updatedAchievements })
      }
    }),
    {
      name: 'dual-n-back-stats',
      // Custom serialization for functions
      partialize: (state) => ({
        stats: state.stats,
        achievements: state.achievements.map(a => ({
          ...a,
          condition: undefined // Don't persist functions
        }))
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore achievement conditions after loading
          state.achievements = restoreAchievementConditions(state.achievements)
        }
      }
    }
  )
)
```

## ⚙️ Settings Store

### State Structure

```typescript
interface SettingsState {
  settings: GameSettings
}

interface GameSettings {
  // Game Configuration
  nLevel: number
  totalRounds: number
  showVisual: boolean
  showAudio: boolean
  
  // Timing
  stimulusDuration: number
  interstimulusInterval: number
  
  // Visual Settings
  gridSize: number
  
  // Audio Settings
  audioType: 'tones' | 'letters' | 'numbers'
  volume: number
  
  // Behavior
  autoAdvance: boolean
}
```

### Implementation

```typescript
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      resetSettings: () => set({ settings: defaultSettings }),
      
      // Validation methods
      isValidNLevel: (nLevel: number) => 
        Number.isInteger(nLevel) && nLevel >= 1 && nLevel <= 10,
      
      isValidGridSize: (gridSize: number) => 
        [3, 4, 5].includes(gridSize)
    }),
    {
      name: 'dual-n-back-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
)
```

## 🔄 State Patterns

### Optimistic Updates

```typescript
// Pattern for immediate UI feedback
const submitResponseOptimistic = (type: ResponseType) => {
  // 1. Immediate UI update
  set((state) => ({
    feedback: { [type]: true }, // Assume correct initially
    waitingForResponse: false
  }))
  
  // 2. Validate and correct if needed
  setTimeout(() => {
    const isActuallyCorrect = validateResponse(type)
    set((state) => ({
      feedback: { [type]: isActuallyCorrect }
    }))
  }, 100)
}
```

### Computed State

```typescript
// Pattern for derived state
const useGameProgress = () => {
  return useGameStore((state) => {
    const totalStimuli = state.sequence.length
    const currentIndex = state.currentStimulusIndex
    const progress = totalStimuli > 0 ? (currentIndex / totalStimuli) * 100 : 0
    
    return {
      progress,
      remaining: totalStimuli - currentIndex,
      isComplete: currentIndex >= totalStimuli
    }
  })
}
```

### Selective Subscriptions

```typescript
// Subscribe only to needed state slices
const GameBoard = () => {
  // Only re-render when score changes
  const score = useGameStore(state => state.score)
  
  // Only re-render when current stimulus changes
  const currentStimulusIndex = useGameStore(state => state.currentStimulusIndex)
  
  // Combine multiple subscriptions efficiently
  const { gamePhase, isPlaying } = useGameStore(
    useCallback(state => ({
      gamePhase: state.gamePhase,
      isPlaying: state.isPlaying
    }), [])
  )
}
```

## 🎯 Performance Optimization

### Memoization Patterns

```typescript
// Memoize expensive calculations
const useGameAnalytics = () => {
  const responses = useGameStore(state => state.responses)
  
  return useMemo(() => {
    return {
      accuracy: calculateAccuracy(responses),
      averageResponseTime: calculateAverageResponseTime(responses),
      performanceTrend: analyzePerformanceTrend(responses)
    }
  }, [responses])
}
```

### Debounced Updates

```typescript
// Debounce frequent updates
const useDebouncedPerformanceUpdate = () => {
  const responses = useGameStore(state => state.responses)
  
  const debouncedUpdate = useMemo(
    () => debounce((responses: Response[]) => {
      const snapshot = createPerformanceSnapshot(responses)
      useGameStore.getState().updatePerformanceHistory(snapshot)
    }, 1000),
    []
  )
  
  useEffect(() => {
    debouncedUpdate(responses)
  }, [responses, debouncedUpdate])
}
```

### Batch Updates

```typescript
// Batch multiple state updates
const endGameWithResults = (finalScore: GameScore) => {
  // Single update with all changes
  set((state) => ({
    isPlaying: false,
    gamePhase: 'completed',
    gameEndTime: Date.now(),
    score: finalScore,
    // Trigger statistics update
    [Symbol.for('batch-update')]: true
  }))
  
  // Handle side effects after state update
  setTimeout(() => {
    const session = createGameSession(get())
    useStatsStore.getState().addSession(session)
  }, 0)
}
```

## 🔍 Debugging State

### Development Tools

```typescript
// Enable state logging in development
const withLogging = (config) => (set, get, api) =>
  config(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('State update:', args)
      }
      set(...args)
    },
    get,
    api
  )

export const useGameStore = create(withLogging(gameStoreConfig))
```

### State Inspection

```typescript
// Add state inspection helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugStores = {
    game: useGameStore,
    stats: useStatsStore,
    settings: useSettingsStore,
    
    // Utility functions
    getGameState: () => useGameStore.getState(),
    getPerformanceHistory: () => useGameStore.getState().performanceHistory,
    triggerAdaptiveAnalysis: () => {
      const state = useGameStore.getState()
      const triggers = analyzeAdaptiveTriggers(state.performanceHistory, state.nLevel)
      console.log('Adaptive Analysis:', triggers)
    }
  }
}
```

### State Validation

```typescript
// Validate state consistency
const validateGameState = (state: GameState): boolean => {
  const issues: string[] = []
  
  if (state.currentStimulusIndex < 0) {
    issues.push('Invalid stimulus index')
  }
  
  if (state.currentStimulusIndex >= state.sequence.length && state.isPlaying) {
    issues.push('Stimulus index out of bounds')
  }
  
  if (state.responses.length > state.sequence.length) {
    issues.push('More responses than stimuli')
  }
  
  if (issues.length > 0) {
    console.warn('State validation issues:', issues)
    return false
  }
  
  return true
}
```

## 🧪 Testing State

### Store Testing

```typescript
// Test store actions
describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })
  
  it('should start game correctly', () => {
    const { startGame, isPlaying, gamePhase } = useGameStore.getState()
    
    startGame()
    
    expect(isPlaying).toBe(true)
    expect(gamePhase).toBe('stimulus')
  })
  
  it('should handle responses correctly', () => {
    const { startGame, submitResponse, score } = useGameStore.getState()
    
    startGame()
    submitResponse('position')
    
    const finalScore = useGameStore.getState().score
    expect(finalScore.totalCorrect + finalScore.totalIncorrect).toBeGreaterThan(0)
  })
})
```

### Integration Testing

```typescript
// Test store interactions
describe('Store Integration', () => {
  it('should sync game completion with statistics', async () => {
    const gameStore = useGameStore.getState()
    const statsStore = useStatsStore.getState()
    
    // Start and complete a game
    gameStore.startGame()
    gameStore.endGame()
    
    // Verify statistics update
    await waitFor(() => {
      const stats = statsStore.stats
      expect(stats.totalGamesPlayed).toBeGreaterThan(0)
    })
  })
})
```

## 🔒 State Security

### Data Sanitization

```typescript
// Sanitize user input before storing
const sanitizeSettings = (settings: Partial<GameSettings>): Partial<GameSettings> => {
  const sanitized: Partial<GameSettings> = {}
  
  if (settings.nLevel !== undefined) {
    sanitized.nLevel = Math.max(1, Math.min(10, Math.floor(settings.nLevel)))
  }
  
  if (settings.volume !== undefined) {
    sanitized.volume = Math.max(0, Math.min(1, settings.volume))
  }
  
  if (settings.gridSize !== undefined) {
    sanitized.gridSize = [3, 4, 5].includes(settings.gridSize) ? settings.gridSize : 3
  }
  
  return sanitized
}
```

### State Recovery

```typescript
// Handle corrupted state
const recoverState = (corruptedState: any): GameState => {
  try {
    // Validate and merge with defaults
    return {
      ...initialGameState,
      ...validateAndMergeState(corruptedState)
    }
  } catch (error) {
    console.warn('State recovery failed, using defaults:', error)
    return initialGameState
  }
}
```

---

This state management architecture provides a robust, scalable, and maintainable foundation for the Dual N-Back application, ensuring consistent behavior across all components while maintaining excellent performance and developer experience.

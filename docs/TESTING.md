# Testing Guide

This document provides comprehensive testing guidelines, patterns, and best practices for the Dual N-Back application.

## 🧪 Testing Philosophy

Our testing approach follows the **Testing Trophy** pattern with emphasis on integration tests that provide the highest confidence while maintaining good unit test coverage for critical algorithms.

```
        ┌─────────────────┐
        │   E2E Tests     │  ← 10% Coverage, High Confidence
        │   (Cypress)     │
        ├─────────────────┤
        │ Integration     │  ← 60% Coverage, Best ROI
        │ Tests (RTL)     │
        ├─────────────────┤
        │  Unit Tests     │  ← 25% Coverage, Fast Feedback
        │  (Jest/Vitest)  │
        ├─────────────────┤
        │ Static Tests    │  ← 5% Coverage, TypeScript
        │ (TypeScript)    │
        └─────────────────┘
```

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- GameBoard.test.tsx

# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### Test Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Test setup and global mocks
│   ├── utils/                # Test utilities and helpers
│   └── fixtures/             # Test data and fixtures
├── components/
│   └── __tests__/           # Component tests
├── stores/
│   └── __tests__/           # Store tests
├── utils/
│   └── __tests__/           # Utility function tests
└── e2e/
    ├── specs/               # E2E test specifications
    ├── fixtures/            # E2E test data
    └── support/             # E2E support files
```

## 🔧 Unit Testing

### Testing Utilities

```typescript
// src/utils/__tests__/gameLogic.test.ts
import { 
  calculateAccuracy, 
  validateResponse, 
  generateEngagingSequence 
} from '../gameLogic'

describe('gameLogic utilities', () => {
  describe('calculateAccuracy', () => {
    it('should calculate accuracy correctly with no missed opportunities', () => {
      const result = calculateAccuracy(8, 2, 0)
      expect(result).toBe(80) // 8/(8+2) = 0.8
    })
    
    it('should include missed opportunities as failures', () => {
      const result = calculateAccuracy(9, 0, 6)
      expect(result).toBe(60) // 9/(9+0+6) = 0.6
    })
    
    it('should handle edge cases', () => {
      expect(calculateAccuracy(0, 0, 0)).toBe(0)
      expect(calculateAccuracy(10, 0, 0)).toBe(100)
      expect(calculateAccuracy(0, 10, 0)).toBe(0)
    })
  })
  
  describe('validateResponse', () => {
    const mockSequence = [
      { position: 0, audio: 'A' },
      { position: 1, audio: 'B' },
      { position: 0, audio: 'A' }, // position match at n=2
      { position: 2, audio: 'A' }  // audio match at n=2
    ]
    
    it('should validate position matches correctly', () => {
      const isCorrect = validateResponse(
        'position', 
        mockSequence, 
        2, // current index
        2  // n-level
      )
      expect(isCorrect).toBe(true)
    })
    
    it('should validate audio matches correctly', () => {
      const isCorrect = validateResponse(
        'audio', 
        mockSequence, 
        3, // current index
        2  // n-level
      )
      expect(isCorrect).toBe(true)
    })
    
    it('should reject invalid responses', () => {
      const isCorrect = validateResponse(
        'position', 
        mockSequence, 
        1, // current index
        2  // n-level (no match)
      )
      expect(isCorrect).toBe(false)
    })
  })
  
  describe('generateEngagingSequence', () => {
    it('should generate sequence with correct length', () => {
      const sequence = generateEngagingSequence(20, 3, 2, 'medium')
      expect(sequence).toHaveLength(20)
    })
    
    it('should respect grid size constraints', () => {
      const sequence = generateEngagingSequence(20, 3, 2, 'medium')
      sequence.forEach(item => {
        expect(item.position).toBeGreaterThanOrEqual(0)
        expect(item.position).toBeLessThan(9) // 3x3 grid
      })
    })
    
    it('should include appropriate number of matches', () => {
      const sequence = generateEngagingSequence(100, 3, 2, 'medium')
      const positionMatches = countMatches(sequence, 2, 'position')
      const audioMatches = countMatches(sequence, 2, 'audio')
      
      // Medium difficulty should have 20-30% matches
      expect(positionMatches).toBeGreaterThanOrEqual(15)
      expect(positionMatches).toBeLessThanOrEqual(35)
      expect(audioMatches).toBeGreaterThanOrEqual(15)
      expect(audioMatches).toBeLessThanOrEqual(35)
    })
  })
})
```

### Testing Adaptive Algorithm

```typescript
// src/utils/__tests__/adaptiveAlgorithm.test.ts
describe('Adaptive Algorithm', () => {
  describe('analyzeAdaptiveTriggers', () => {
    it('should suggest level increase for high performance', () => {
      const highPerformanceHistory = [
        { accuracy: 95, avgResponseTime: 800, confidence: 0.9 },
        { accuracy: 93, avgResponseTime: 750, confidence: 0.85 },
        { accuracy: 97, avgResponseTime: 700, confidence: 0.95 }
      ]
      
      const triggers = analyzeAdaptiveTriggers(highPerformanceHistory, 2)
      
      expect(triggers.shouldAdjust).toBe(true)
      expect(triggers.suggestedLevel).toBe(3)
      expect(triggers.reason).toContain('high performance')
    })
    
    it('should suggest level decrease for struggling player', () => {
      const lowPerformanceHistory = [
        { accuracy: 45, avgResponseTime: 1500, confidence: 0.3 },
        { accuracy: 40, avgResponseTime: 1600, confidence: 0.25 },
        { accuracy: 35, avgResponseTime: 1700, confidence: 0.2 }
      ]
      
      const triggers = analyzeAdaptiveTriggers(lowPerformanceHistory, 3)
      
      expect(triggers.shouldAdjust).toBe(true)
      expect(triggers.suggestedLevel).toBe(2)
      expect(triggers.reason).toContain('struggling')
    })
  })
  
  describe('generateAdaptiveSequence', () => {
    it('should adjust difficulty based on performance', () => {
      const strugglingHistory = [
        { accuracy: 40, avgResponseTime: 1600, confidence: 0.3 }
      ]
      
      const sequence = generateAdaptiveSequence(
        50, 3, 3, 'hard', strugglingHistory
      )
      
      // Should be easier than standard hard difficulty
      const matches = countTotalMatches(sequence, 3)
      expect(matches).toBeGreaterThan(15) // More matches = easier
    })
  })
})
```

## 🏗️ Component Testing

### Testing Game Components

```typescript
// src/components/game/__tests__/GameBoard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GameBoard } from '../GameBoard'
import { useGameStore } from '../../../stores/gameStore'
import { MockStoreProvider } from '../../../__tests__/utils/MockStoreProvider'

// Mock the stores
jest.mock('../../../stores/gameStore')
jest.mock('../../../stores/settingsStore')

const mockGameStore = {
  isPlaying: false,
  gamePhase: 'waiting' as const,
  score: { correct: 0, incorrect: 0, totalCorrect: 0, totalIncorrect: 0 },
  currentStimulus: null,
  responses: [],
  startGame: jest.fn(),
  submitResponse: jest.fn(),
  pauseGame: jest.fn()
}

beforeEach(() => {
  (useGameStore as jest.MockedFunction<typeof useGameStore>)
    .mockReturnValue(mockGameStore)
})

describe('GameBoard', () => {
  it('should render initial state correctly', () => {
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    expect(screen.getByText(/start game/i)).toBeInTheDocument()
    expect(screen.getByText(/score: 0%/i)).toBeInTheDocument()
  })
  
  it('should start game when start button is clicked', () => {
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    fireEvent.click(screen.getByText(/start game/i))
    expect(mockGameStore.startGame).toHaveBeenCalled()
  })
  
  it('should handle position responses', async () => {
    const playingStore = {
      ...mockGameStore,
      isPlaying: true,
      gamePhase: 'response' as const,
      currentStimulus: { position: 4, audio: 'C' }
    }
    
    ;(useGameStore as jest.MockedFunction<typeof useGameStore>)
      .mockReturnValue(playingStore)
    
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    // Simulate keyboard response
    fireEvent.keyDown(document, { key: 'f', code: 'KeyF' })
    
    await waitFor(() => {
      expect(playingStore.submitResponse).toHaveBeenCalledWith('position')
    })
  })
  
  it('should display accuracy correctly', () => {
    const scoreStore = {
      ...mockGameStore,
      score: { 
        correct: 8, 
        incorrect: 2, 
        totalCorrect: 8, 
        totalIncorrect: 2 
      }
    }
    
    ;(useGameStore as jest.MockedFunction<typeof useGameStore>)
      .mockReturnValue(scoreStore)
    
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    expect(screen.getByText(/score: 80%/i)).toBeInTheDocument()
  })
  
  it('should show game completion correctly', () => {
    const completedStore = {
      ...mockGameStore,
      gamePhase: 'completed' as const,
      score: { 
        correct: 15, 
        incorrect: 5, 
        totalCorrect: 15, 
        totalIncorrect: 5 
      }
    }
    
    ;(useGameStore as jest.MockedFunction<typeof useGameStore>)
      .mockReturnValue(completedStore)
    
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    expect(screen.getByText(/game completed/i)).toBeInTheDocument()
    expect(screen.getByText(/final score: 75%/i)).toBeInTheDocument()
  })
})
```

### Testing Stimulus Display

```typescript
// src/components/game/__tests__/StimulusDisplay.test.tsx
describe('StimulusDisplay', () => {
  it('should highlight correct position', () => {
    const stimulus = { position: 4, audio: 'A' }
    
    render(
      <StimulusDisplay 
        stimulus={stimulus}
        gridSize={3}
        showVisual={true}
      />
    )
    
    const cells = screen.getAllByTestId('grid-cell')
    expect(cells[4]).toHaveClass('highlighted')
    expect(cells[0]).not.toHaveClass('highlighted')
  })
  
  it('should play audio when audio is enabled', () => {
    const mockPlayAudio = jest.fn()
    jest.spyOn(require('../../../utils/audioUtils'), 'playAudioStimulus')
      .mockImplementation(mockPlayAudio)
    
    const stimulus = { position: 4, audio: 'A' }
    
    render(
      <StimulusDisplay 
        stimulus={stimulus}
        gridSize={3}
        showAudio={true}
      />
    )
    
    expect(mockPlayAudio).toHaveBeenCalledWith('A')
  })
  
  it('should not show visual when disabled', () => {
    const stimulus = { position: 4, audio: 'A' }
    
    render(
      <StimulusDisplay 
        stimulus={stimulus}
        gridSize={3}
        showVisual={false}
      />
    )
    
    const cells = screen.getAllByTestId('grid-cell')
    cells.forEach(cell => {
      expect(cell).not.toHaveClass('highlighted')
    })
  })
})
```

## 🔄 Store Testing

### Testing Zustand Stores

```typescript
// src/stores/__tests__/gameStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '../gameStore'

// Reset store before each test
beforeEach(() => {
  useGameStore.setState({
    isPlaying: false,
    gamePhase: 'waiting',
    currentStimulusIndex: 0,
    responses: [],
    score: { correct: 0, incorrect: 0, totalCorrect: 0, totalIncorrect: 0 }
  })
})

describe('gameStore', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGameStore())
    
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.gamePhase).toBe('waiting')
    expect(result.current.score.totalCorrect).toBe(0)
  })
  
  it('should start game correctly', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.startGame()
    })
    
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.gamePhase).toBe('stimulus')
    expect(result.current.sequence.length).toBeGreaterThan(0)
  })
  
  it('should handle responses correctly', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.startGame()
    })
    
    act(() => {
      result.current.submitResponse('position')
    })
    
    expect(result.current.responses).toHaveLength(1)
    expect(result.current.responses[0].type).toBe('position')
  })
  
  it('should calculate scores correctly', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.startGame()
    })
    
    // Submit correct response
    act(() => {
      result.current.submitResponse('position')
    })
    
    const { score } = result.current
    expect(score.totalCorrect + score.totalIncorrect).toBe(1)
  })
})
```

### Testing Store Persistence

```typescript
// src/stores/__tests__/statsStore.test.ts
describe('statsStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  it('should persist statistics to localStorage', () => {
    const { result } = renderHook(() => useStatsStore())
    
    const mockSession = {
      id: '123',
      startTime: Date.now(),
      endTime: Date.now() + 60000,
      nLevel: 2,
      finalScore: { correct: 8, incorrect: 2, totalCorrect: 8, totalIncorrect: 2 },
      responses: []
    }
    
    act(() => {
      result.current.addSession(mockSession)
    })
    
    // Check localStorage
    const stored = localStorage.getItem('dual-n-back-stats')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.state.stats.sessions).toHaveLength(1)
  })
  
  it('should restore state from localStorage', () => {
    // Pre-populate localStorage
    const initialState = {
      state: {
        stats: {
          sessions: [{ id: '123', nLevel: 2 }],
          totalGamesPlayed: 1
        }
      },
      version: 0
    }
    
    localStorage.setItem('dual-n-back-stats', JSON.stringify(initialState))
    
    const { result } = renderHook(() => useStatsStore())
    
    expect(result.current.stats.totalGamesPlayed).toBe(1)
    expect(result.current.stats.sessions).toHaveLength(1)
  })
})
```

## 🔗 Integration Testing

### Testing Component-Store Integration

```typescript
// src/__tests__/integration/gameFlow.test.tsx
describe('Game Flow Integration', () => {
  it('should complete full game cycle', async () => {
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    // Start game
    fireEvent.click(screen.getByText(/start game/i))
    
    await waitFor(() => {
      expect(screen.getByTestId('stimulus-display')).toBeInTheDocument()
    })
    
    // Complete game by submitting responses
    for (let i = 0; i < 20; i++) {
      fireEvent.keyDown(document, { key: 'f' })
      await waitFor(() => {}, { timeout: 100 })
    }
    
    // Verify completion
    await waitFor(() => {
      expect(screen.getByText(/game completed/i)).toBeInTheDocument()
    })
    
    // Verify statistics update
    const statsStore = useStatsStore.getState()
    expect(statsStore.stats.totalGamesPlayed).toBe(1)
  })
  
  it('should handle pause and resume correctly', async () => {
    render(
      <MockStoreProvider>
        <GameBoard />
      </MockStoreProvider>
    )
    
    // Start and pause
    fireEvent.click(screen.getByText(/start game/i))
    fireEvent.click(screen.getByText(/pause/i))
    
    await waitFor(() => {
      expect(screen.getByText(/resume/i)).toBeInTheDocument()
    })
    
    // Resume
    fireEvent.click(screen.getByText(/resume/i))
    
    await waitFor(() => {
      expect(screen.getByText(/pause/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Settings Integration

```typescript
// src/__tests__/integration/settings.test.tsx
describe('Settings Integration', () => {
  it('should apply settings changes to game', async () => {
    render(
      <MockStoreProvider>
        <Settings />
        <GameBoard />
      </MockStoreProvider>
    )
    
    // Change n-level
    const nLevelSlider = screen.getByLabelText(/n-level/i)
    fireEvent.change(nLevelSlider, { target: { value: '3' } })
    
    // Start game
    fireEvent.click(screen.getByText(/start game/i))
    
    // Verify n-level is applied
    const gameStore = useGameStore.getState()
    expect(gameStore.nLevel).toBe(3)
  })
  
  it('should persist settings changes', async () => {
    render(
      <MockStoreProvider>
        <Settings />
      </MockStoreProvider>
    )
    
    // Change settings
    fireEvent.click(screen.getByLabelText(/show audio/i))
    fireEvent.change(screen.getByLabelText(/volume/i), { target: { value: '0.5' } })
    
    // Verify persistence
    const settingsStore = useSettingsStore.getState()
    expect(settingsStore.settings.showAudio).toBe(false)
    expect(settingsStore.settings.volume).toBe(0.5)
    
    // Verify localStorage
    const stored = localStorage.getItem('dual-n-back-settings')
    const parsed = JSON.parse(stored!)
    expect(parsed.state.settings.showAudio).toBe(false)
  })
})
```

## 🎭 E2E Testing with Cypress

### Basic Game Flow

```typescript
// e2e/specs/gameFlow.cy.ts
describe('Game Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('should complete a full game successfully', () => {
    // Start game
    cy.get('[data-cy=start-game]').click()
    
    // Verify game started
    cy.get('[data-cy=stimulus-display]').should('be.visible')
    cy.get('[data-cy=game-phase]').should('contain', 'Playing')
    
    // Wait for game to complete (or simulate responses)
    cy.get('[data-cy=position-response]', { timeout: 30000 })
      .click({ multiple: true })
    
    // Verify completion
    cy.get('[data-cy=game-completed]').should('be.visible')
    cy.get('[data-cy=final-score]').should('contain', '%')
    
    // Check statistics update
    cy.get('[data-cy=stats-games-played]').should('contain', '1')
  })
  
  it('should handle keyboard responses', () => {
    cy.get('[data-cy=start-game]').click()
    
    // Test keyboard shortcuts
    cy.get('body').type('f') // Position response
    cy.get('body').type('j') // Audio response
    
    // Verify responses are registered
    cy.get('[data-cy=responses-count]').should('not.contain', '0')
  })
  
  it('should pause and resume correctly', () => {
    cy.get('[data-cy=start-game]').click()
    
    // Pause
    cy.get('[data-cy=pause-game]').click()
    cy.get('[data-cy=game-phase]').should('contain', 'Paused')
    
    // Resume
    cy.get('[data-cy=resume-game]').click()
    cy.get('[data-cy=game-phase]').should('contain', 'Playing')
  })
})
```

### Settings and Persistence

```typescript
// e2e/specs/settings.cy.ts
describe('Settings and Persistence', () => {
  it('should persist settings across sessions', () => {
    // Modify settings
    cy.get('[data-cy=settings-tab]').click()
    cy.get('[data-cy=n-level-slider]').invoke('val', 3).trigger('change')
    cy.get('[data-cy=grid-size-select]').select('4')
    cy.get('[data-cy=volume-slider]').invoke('val', 0.5).trigger('change')
    
    // Reload page
    cy.reload()
    
    // Verify settings persisted
    cy.get('[data-cy=settings-tab]').click()
    cy.get('[data-cy=n-level-slider]').should('have.value', '3')
    cy.get('[data-cy=grid-size-select]').should('have.value', '4')
    cy.get('[data-cy=volume-slider]').should('have.value', '0.5')
  })
  
  it('should apply settings to game immediately', () => {
    // Change n-level
    cy.get('[data-cy=settings-tab]').click()
    cy.get('[data-cy=n-level-slider]').invoke('val', 4).trigger('change')
    
    // Start game
    cy.get('[data-cy=game-tab]').click()
    cy.get('[data-cy=start-game]').click()
    
    // Verify n-level is applied
    cy.get('[data-cy=current-n-level]').should('contain', '4')
  })
})
```

### Performance Testing

```typescript
// e2e/specs/performance.cy.ts
describe('Performance', () => {
  it('should maintain smooth gameplay', () => {
    cy.get('[data-cy=start-game]').click()
    
    // Monitor frame rate during gameplay
    cy.window().then((win) => {
      let frameCount = 0
      let lastTime = performance.now()
      
      const countFrames = () => {
        frameCount++
        const currentTime = performance.now()
        
        if (currentTime - lastTime >= 1000) {
          expect(frameCount).to.be.at.least(30) // At least 30 FPS
          frameCount = 0
          lastTime = currentTime
        }
        
        win.requestAnimationFrame(countFrames)
      }
      
      win.requestAnimationFrame(countFrames)
    })
    
    // Let game run for a few seconds
    cy.wait(5000)
  })
  
  it('should not memory leak during extended gameplay', () => {
    // Start and stop multiple games
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy=start-game]').click()
      cy.wait(1000)
      cy.get('[data-cy=end-game]').click()
      cy.wait(500)
    }
    
    // Check memory usage (basic check)
    cy.window().then((win) => {
      if (win.performance.memory) {
        const memoryUsage = win.performance.memory.usedJSHeapSize
        expect(memoryUsage).to.be.below(50 * 1024 * 1024) // < 50MB
      }
    })
  })
})
```

## 🧰 Test Utilities

### Mock Store Provider

```typescript
// src/__tests__/utils/MockStoreProvider.tsx
export const MockStoreProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <div data-testid="mock-store-provider">
      {children}
    </div>
  )
}

// Mock store factory
export const createMockGameStore = (overrides = {}) => ({
  isPlaying: false,
  gamePhase: 'waiting' as const,
  nLevel: 2,
  totalRounds: 20,
  sequence: [],
  currentStimulusIndex: 0,
  responses: [],
  score: { correct: 0, incorrect: 0, totalCorrect: 0, totalIncorrect: 0 },
  startGame: jest.fn(),
  submitResponse: jest.fn(),
  pauseGame: jest.fn(),
  endGame: jest.fn(),
  resetGame: jest.fn(),
  ...overrides
})
```

### Test Fixtures

```typescript
// src/__tests__/fixtures/gameData.ts
export const mockGameSequence = [
  { position: 0, audio: 'A' },
  { position: 1, audio: 'B' },
  { position: 0, audio: 'A' }, // position match
  { position: 2, audio: 'B' }, // audio match
  { position: 3, audio: 'C' }
]

export const mockResponses = [
  { type: 'position', correct: false, responseTime: 850, roundIndex: 0 },
  { type: 'audio', correct: true, responseTime: 750, roundIndex: 1 },
  { type: 'position', correct: true, responseTime: 650, roundIndex: 2 }
]

export const mockGameSession = {
  id: 'test-session-123',
  startTime: Date.now() - 60000,
  endTime: Date.now(),
  nLevel: 2,
  finalScore: { correct: 15, incorrect: 5, totalCorrect: 15, totalIncorrect: 5 },
  responses: mockResponses,
  settings: {
    gridSize: 3,
    showVisual: true,
    showAudio: true,
    stimulusDuration: 500,
    interstimulusInterval: 2000
  }
}
```

### Custom Matchers

```typescript
// src/__tests__/setup.ts
import { expect } from '@jest/globals'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidGameSequence(): R
      toHaveCorrectAccuracy(expected: number): R
    }
  }
}

expect.extend({
  toHaveValidGameSequence(received) {
    const isValid = received.every((item: any) => 
      typeof item.position === 'number' &&
      typeof item.audio === 'string' &&
      item.position >= 0 &&
      item.audio.length > 0
    )
    
    return {
      message: () => 
        `expected ${received} to be a valid game sequence`,
      pass: isValid
    }
  },
  
  toHaveCorrectAccuracy(received, expected) {
    const { correct, incorrect, missed = 0 } = received
    const actualAccuracy = (correct / (correct + incorrect + missed)) * 100
    const tolerance = 0.1
    
    const pass = Math.abs(actualAccuracy - expected) < tolerance
    
    return {
      message: () =>
        `expected accuracy ${actualAccuracy} to be within ${tolerance} of ${expected}`,
      pass
    }
  }
})
```

## 📊 Coverage Goals

### Target Coverage

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 85,
        "lines": 85,
        "statements": 85
      },
      "./src/utils/": {
        "branches": 90,
        "functions": 95,
        "lines": 95,
        "statements": 95
      },
      "./src/stores/": {
        "branches": 85,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Coverage Reports

```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage in browser
npm run test:coverage:open

# Generate coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/utils/**/*.ts"
```

## 🚨 Test Best Practices

### Do's ✅

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Follow AAA pattern (Arrange, Act, Assert)**
- **Mock external dependencies**
- **Test edge cases and error conditions**
- **Keep tests focused and atomic**
- **Use data-testid for stable selectors**

### Don'ts ❌

- **Don't test private methods directly**
- **Don't create overly complex test setups**
- **Don't ignore failing tests**
- **Don't test third-party libraries**
- **Don't use implementation details in assertions**
- **Don't write tests that depend on other tests**

### Performance Tips ⚡

- **Use `beforeEach` for common setup**
- **Mock heavy dependencies**
- **Prefer integration tests over unit tests for React components**
- **Use `screen` queries instead of container queries**
- **Avoid `waitFor` when not necessary**

---

This testing guide provides comprehensive coverage of testing strategies, patterns, and best practices to ensure the Dual N-Back application maintains high quality and reliability across all components and features.

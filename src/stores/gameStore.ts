import { create } from 'zustand'
import { GameState, GameSettings, GameSequence, ResponseType } from '../types/game'
import { 
  generateEngagingSequence, 
  generateAdaptiveSequence, 
  createPerformanceSnapshot, 
  analyzeAdaptiveTriggers, 
  type PerformanceSnapshot 
} from '../utils/gameLogic'
import { preloadAudio } from '../utils/audioManager'

const defaultSettings: GameSettings = {
  nLevel: 1,
  totalRounds: 20,
  showVisual: true,
  showAudio: true,
  stimulusDuration: 500,
  interstimulusInterval: 2500,
  gridSize: 3,
  audioType: 'letters',
  volume: 0.5,
  autoAdvance: true,
}

const initialGameState: Omit<GameState, 'nLevel' | 'totalRounds'> = {
  isPlaying: false,
  isPaused: false,
  currentRound: 0,
  sequence: [],
  currentStimulusIndex: -1,
  gamePhase: 'waiting',
  waitingForResponse: false,
  responseDeadline: null,
  responses: [],
  score: {
    positionCorrect: 0,
    positionIncorrect: 0,
    audioCorrect: 0,
    audioIncorrect: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    missedPositional: 0,
    missedAudio: 0,
    totalMissed: 0,
  },
  gameStartTime: null,
  gameEndTime: null,
  feedback: {}
}

interface GameStore extends GameState {
  settings: GameSettings
  performanceHistory: PerformanceSnapshot[]
  adaptiveMode: boolean
  
  // Actions
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  stopGame: () => void
  endGame: () => void
  resetGame: () => void
  updateSettings: (newSettings: Partial<GameSettings>) => void
  setSequence: (sequence: GameSequence[]) => void
  toggleAdaptiveMode: () => void
  
  // Stimulus management
  presentStimulus: (index: number) => void
  waitForResponse: () => void
  nextStimulus: () => void
  
  // Response handling
  submitResponse: (type?: ResponseType) => void
  submitResponseIfValid: (type: ResponseType) => void
  
  // Computed values
  currentStimulus: () => GameSequence | null
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...initialGameState,
  nLevel: defaultSettings.nLevel,
  totalRounds: defaultSettings.totalRounds,
  settings: defaultSettings,
  performanceHistory: [],
  adaptiveMode: true, // Enable adaptive difficulty by default

  // Actions
  startGame: () => {
    const state = get()
    
    // Determine difficulty based on nLevel for optimal engagement
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
    
    // Preload audio to ensure voices are ready
    preloadAudio().catch(console.error)
    
    set({
      sequence,
      isPlaying: true,
      isPaused: false,
      currentRound: 0,
      currentStimulusIndex: 0,
      gamePhase: 'stimulus',
      waitingForResponse: false,
      responseDeadline: null,
      gameStartTime: Date.now(),
      gameEndTime: null,
      responses: [],
      score: {
        positionCorrect: 0,
        positionIncorrect: 0,
        audioCorrect: 0,
        audioIncorrect: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        missedPositional: 0,
        missedAudio: 0,
        totalMissed: 0,
      },
      feedback: {}
    })
  },

  pauseGame: () => set({
    isPaused: true,
    gamePhase: 'waiting',
  }),

  resumeGame: () => {
    const { currentStimulusIndex, sequence } = get()
    set({
      isPaused: false,
      gamePhase: currentStimulusIndex < sequence.length ? 'stimulus' : 'completed',
    })
  },

  stopGame: () => set({
    isPlaying: false,
    isPaused: false,
    gamePhase: 'completed',
    gameEndTime: Date.now(),
  }),

  endGame: () => set({
    isPlaying: false,
    gamePhase: 'completed',
    gameEndTime: Date.now(),
  }),

  resetGame: () => {
    const { nLevel, totalRounds } = get()
    set({
      ...initialGameState,
      nLevel,
      totalRounds,
    })
  },

  updateSettings: (newSettings) => {
    const currentSettings = get().settings
    const updatedSettings = { ...currentSettings, ...newSettings }
    
    set({
      settings: updatedSettings,
      nLevel: newSettings.nLevel ?? get().nLevel,
      totalRounds: newSettings.totalRounds ?? get().totalRounds,
    })
  },

  toggleAdaptiveMode: () => {
    const current = get().adaptiveMode
    set({ adaptiveMode: !current })
    console.log(`🧠 Adaptive Difficulty: ${!current ? 'ENABLED' : 'DISABLED'}`)
  },

  setSequence: (sequence) => set({ sequence }),

  presentStimulus: (index) => set({
    currentStimulusIndex: index,
    gamePhase: 'stimulus',
    waitingForResponse: false,
    responseDeadline: null,
  }),

  waitForResponse: () => {
    const { currentStimulusIndex, nLevel } = get()
    const shouldWaitForResponse = currentStimulusIndex >= nLevel
    
    if (!shouldWaitForResponse) {
      set({
        gamePhase: 'waiting',
        waitingForResponse: false,
        responseDeadline: null,
      })
      return
    }
    
    set({
      gamePhase: 'response',
      waitingForResponse: true,
      responseDeadline: Date.now() + 3000, // 3 second response window
      feedback: {}, // Reset feedback for new stimulus
    })
  },

  nextStimulus: () => {
    const { currentStimulusIndex, sequence, nLevel } = get()
    const nextIndex = currentStimulusIndex + 1
    
    if (nextIndex >= sequence.length) {
      set({
        isPlaying: false,
        gamePhase: 'completed',
        gameEndTime: Date.now(),
      })
      return
    }
    
    set({
      currentStimulusIndex: nextIndex,
      currentRound: Math.max(1, nextIndex - nLevel + 1),
      gamePhase: 'stimulus',
      waitingForResponse: false,
      responseDeadline: null,
    })
  },

  submitResponse: (type) => {
    const state = get()
    const { sequence, currentStimulusIndex, nLevel, score, responses, responseDeadline, currentRound } = state
    
    const currentSequence = sequence[currentStimulusIndex]
    const nBackIndex = currentStimulusIndex - nLevel
    
    let positionCorrect = score.positionCorrect
    let positionIncorrect = score.positionIncorrect
    let audioCorrect = score.audioCorrect
    let audioIncorrect = score.audioIncorrect
    let missedPositional = score.missedPositional
    let missedAudio = score.missedAudio
    const newResponses = [...responses]
    let correct = false

    // Only check if we're past the N-back threshold
    if (nBackIndex >= 0) {
      const nBackSequence = sequence[nBackIndex]
      
      if (type) {
        // User provided a response
        if (type === 'position') {
          correct = nBackSequence.position === currentSequence.position
          if (correct) {
            positionCorrect++
          } else {
            positionIncorrect++
          }
        }

        if (type === 'audio') {
          correct = nBackSequence.audio === currentSequence.audio
          if (correct) {
            audioCorrect++
          } else {
            audioIncorrect++
          }
        }
        
        newResponses.push({
          type,
          responseTime: responseDeadline ? Date.now() - (responseDeadline - 3000) : 0,
          roundIndex: currentRound,
          correct,
        })
      } else {
        // No response provided - check for missed opportunities
        if (nBackSequence.position === currentSequence.position) {
          missedPositional++
        }
        if (nBackSequence.audio === currentSequence.audio) {
          missedAudio++
        }
      }
    }

    set({
      responses: newResponses,
      score: {
        positionCorrect,
        positionIncorrect,
        audioCorrect,
        audioIncorrect,
        totalCorrect: positionCorrect + audioCorrect,
        totalIncorrect: positionIncorrect + audioIncorrect,
        missedPositional,
        missedAudio,
        totalMissed: missedPositional + missedAudio,
      },
      waitingForResponse: false,
      gamePhase: 'feedback',
      responseDeadline: null,
      feedback: {
        position: type === 'position' ? correct : undefined,
        audio: type === 'audio' ? correct : undefined,
      }
    })

    // Adaptive difficulty: Create performance snapshot and analyze triggers
    const updatedState = get()
    if (updatedState.adaptiveMode && updatedState.responses.length % 5 === 0) {
      const snapshot = createPerformanceSnapshot(updatedState.responses, 10)
      const newPerformanceHistory = [...updatedState.performanceHistory, snapshot]
      
      // Analyze if difficulty should be adjusted
      const triggers = analyzeAdaptiveTriggers(newPerformanceHistory, updatedState.nLevel)
      
      set({ 
        performanceHistory: newPerformanceHistory.slice(-20) // Keep last 20 snapshots
      })
      
      // Log adaptive insights for debugging
      if (triggers.shouldAdjust) {
        console.log(`🧠 Adaptive AI: ${triggers.reason} (${triggers.urgency} urgency) - Recommend: ${triggers.recommendedAction}`)
      }
    }
  },

  submitResponseIfValid: (type) => {
    const { currentStimulusIndex, nLevel, waitingForResponse } = get()
    const nBackIndex = currentStimulusIndex - nLevel
    
    if (nBackIndex >= 0 && waitingForResponse) {
      get().submitResponse(type)
    }
  },

  // Computed values
  currentStimulus: () => {
    const { currentStimulusIndex, sequence } = get()
    return currentStimulusIndex >= 0 && currentStimulusIndex < sequence.length
      ? sequence[currentStimulusIndex]
      : null
  },
}))

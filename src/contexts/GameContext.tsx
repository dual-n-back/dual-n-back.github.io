import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { GameState, GameSettings, GameSequence, ResponseType } from '../types/game'
import { generateGameSequence } from '../utils/gameLogic'

interface GameContextType {
  state: GameState
  settings: GameSettings
  currentStimulus: GameSequence | null
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  stopGame: () => void
  submitResponse: (type: ResponseType) => void
  updateSettings: (newSettings: Partial<GameSettings>) => void
  resetGame: () => void
}

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'STOP_GAME' }
  | { type: 'NEXT_STIMULUS' }
  | { type: 'PRESENT_STIMULUS'; payload: { index: number } }
  | { type: 'WAIT_FOR_RESPONSE' }
  | { type: 'SUBMIT_RESPONSE'; payload: { type?: ResponseType } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESET_GAME' }
  | { type: 'SET_SEQUENCE'; payload: GameSequence[] }
  | { type: 'END_GAME' }

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

const initialState: GameState = {
    isPlaying: false,
    isPaused: false,
    currentRound: 0,
    totalRounds: defaultSettings.totalRounds,
    nLevel: defaultSettings.nLevel,
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
    },
    gameStartTime: null,
    gameEndTime: null,
    feedback: {}
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
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
        },
      }

    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true,
        gamePhase: 'waiting',
      }

    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false,
        gamePhase: state.currentStimulusIndex < state.sequence.length ? 'stimulus' : 'completed',
      }

    case 'STOP_GAME':
    case 'END_GAME':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        gamePhase: 'completed',
        gameEndTime: Date.now(),
      }

    case 'PRESENT_STIMULUS': {
      const stimulusIndex = action.payload.index
      return {
        ...state,
        currentStimulusIndex: stimulusIndex,
        gamePhase: 'stimulus',
        waitingForResponse: false,
        responseDeadline: null,
      }
    }

    case 'WAIT_FOR_RESPONSE': {
      // Only wait for response if we're past the N-back threshold
      const shouldWaitForResponse = state.currentStimulusIndex >= state.nLevel
      
      if (!shouldWaitForResponse) {
        // If we don't need a response, use waiting phase for interstimulus interval
        return {
          ...state,
          gamePhase: 'waiting',
          waitingForResponse: false,
          responseDeadline: null,
        }
      }
      
      return {
        ...state,
        gamePhase: 'response',
        waitingForResponse: true,
        responseDeadline: Date.now() + 3000, // 3 second response window
        feedback: {}, // Reset feedback for new stimulus
      }
    }

    case 'NEXT_STIMULUS': {
      const nextIndex = state.currentStimulusIndex + 1
      if (nextIndex >= state.sequence.length) {
        return {
          ...state,
          isPlaying: false,
          gamePhase: 'completed',
          gameEndTime: Date.now(),
        }
      }
      
      return {
        ...state,
        currentStimulusIndex: nextIndex,
        currentRound: Math.max(1, nextIndex - state.nLevel + 1),
        gamePhase: 'stimulus',
        waitingForResponse: false,
        responseDeadline: null,
      }
    }

    case 'SUBMIT_RESPONSE': {
      const { type } = action.payload
      const currentSequence = state.sequence[state.currentStimulusIndex]
      const nBackIndex = state.currentStimulusIndex - state.nLevel
      
      let positionCorrect = state.score.positionCorrect
      let positionIncorrect = state.score.positionIncorrect
      let audioCorrect = state.score.audioCorrect
      let audioIncorrect = state.score.audioIncorrect
      const newResponses = [...state.responses]
      let correct = false

      // Only check if we're past the N-back threshold
      if (nBackIndex >= 0) {
        const nBackSequence = state.sequence[nBackIndex]
        
        // Check position response
        if (type === 'position') {
        correct = nBackSequence.position === currentSequence.position
          if (correct) {
            positionCorrect++
          } else {
            positionIncorrect++
          }
        }

        // Check audio response
        if (type === 'audio') {
          correct = nBackSequence.audio === currentSequence.audio
          if (correct) {
            audioCorrect++
          } else {
            audioIncorrect++
          }
          
          // Create UserResponse record for audio
        }
        newResponses.push({
            type,
            responseTime: state.responseDeadline ? Date.now() - (state.responseDeadline - 3000) : 0,
            roundIndex: state.currentRound,
            correct,
          })
      }

      return {
        ...state,
        responses: newResponses,
        score: {
          positionCorrect,
          positionIncorrect,
          audioCorrect,
          audioIncorrect,
          totalCorrect: positionCorrect + audioCorrect,
          totalIncorrect: positionIncorrect + audioIncorrect,
        },
        waitingForResponse: false,
        gamePhase: 'feedback',
        responseDeadline: null,
        feedback: {
            position: type === 'position' ? correct : undefined,
            audio: type === 'audio' ? correct : undefined,
        }
      }
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        nLevel: action.payload.nLevel ?? state.nLevel,
        totalRounds: action.payload.totalRounds ?? state.totalRounds,
      }

    case 'SET_SEQUENCE':
      return {
        ...state,
        sequence: action.payload,
      }

    case 'RESET_GAME':
      return {
        ...initialState,
        nLevel: state.nLevel,
        totalRounds: state.totalRounds,
      }

    default:
      return state
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [settings, setSettings] = React.useState<GameSettings>(defaultSettings)

  // Get current stimulus
  const currentStimulus = state.currentStimulusIndex >= 0 && state.currentStimulusIndex < state.sequence.length
    ? state.sequence[state.currentStimulusIndex]
    : null

  // Game flow management
  useEffect(() => {
    if (!state.isPlaying || state.isPaused) return

    let timer: ReturnType<typeof setTimeout>

    if (state.gamePhase === 'stimulus') {
      // Show stimulus for specified duration, then wait for response or advance
      timer = setTimeout(() => {
        dispatch({ type: 'WAIT_FOR_RESPONSE' })
      }, settings.stimulusDuration)
    } else if (state.gamePhase === 'response') {
      // Wait for response or timeout
      timer = setTimeout(() => {
        // No response given, treat as no match for both modalities
        dispatch({ type: 'SUBMIT_RESPONSE', payload: {} })
      }, 3000) // 3 second response window
    } else if (state.gamePhase === 'feedback') {
      // Brief pause before next stimulus
      timer = setTimeout(() => {
        dispatch({ type: 'NEXT_STIMULUS' })
      }, 500)
    } else if (state.gamePhase === 'waiting') {
      // Brief pause between stimuli (for early stimuli that don't need response)
      timer = setTimeout(() => {
        dispatch({ type: 'NEXT_STIMULUS' })
      }, settings.interstimulusInterval)
    }

    return () => clearTimeout(timer)
  }, [state.gamePhase, state.isPlaying, state.isPaused, settings.stimulusDuration, settings.interstimulusInterval])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!state.isPlaying || !state.waitingForResponse) return

      switch (event.key.toLowerCase()) {
        case 'a': // Left arrow or A key for position match
        case 'arrowleft':
          if (settings.showVisual) {
            dispatch({ type: 'SUBMIT_RESPONSE', payload: { type: 'position' } })
          }
          break
        case 'l': // Right arrow or L key for audio match  
        case 'arrowright':
          if (settings.showAudio) {
            dispatch({ type: 'SUBMIT_RESPONSE', payload: { type: 'audio' } })
          }
          break
        case ' ': // Spacebar for no match
        case 'n':
          dispatch({ type: 'SUBMIT_RESPONSE', payload: {} })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [state.isPlaying, state.waitingForResponse, settings.showVisual, settings.showAudio])

  const startGame = useCallback(() => {
    const sequence = generateGameSequence(state.totalRounds + state.nLevel, settings.gridSize)
    dispatch({ type: 'SET_SEQUENCE', payload: sequence })
    dispatch({ type: 'START_GAME' })
  }, [state.totalRounds, state.nLevel, settings.gridSize])

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' })
  }, [])

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' })
  }, [])

  const stopGame = useCallback(() => {
    dispatch({ type: 'STOP_GAME' })
  }, [])

  const submitResponse = useCallback((responseType: ResponseType) => {
    const nBackIndex = state.currentStimulusIndex - state.nLevel
    
    if (nBackIndex >= 0 && state.waitingForResponse) {
       dispatch({ type: 'SUBMIT_RESPONSE', payload: { type: responseType } })
    }
  }, [state.waitingForResponse, state.sequence, state.currentStimulusIndex, state.nLevel])

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  const value: GameContextType = {
    state,
    settings,
    currentStimulus,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    submitResponse,
    updateSettings,
    resetGame,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

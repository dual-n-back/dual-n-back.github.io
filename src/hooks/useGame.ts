import { useGameStore } from '../stores/gameStore'
import { useGameFlow } from './useGameFlow'
import { ResponseType } from '../types/game'

export const useGame = () => {
  const store = useGameStore()
  
  // Initialize game flow (timers and keyboard controls)
  useGameFlow()
  
  // Create a simplified submitResponse that checks conditions
  const submitResponse = (responseType: ResponseType) => {
    const { currentStimulusIndex, nLevel, waitingForResponse } = store
    const nBackIndex = currentStimulusIndex - nLevel
    
    if (nBackIndex >= 0 && waitingForResponse) {
      store.submitResponse(responseType)
    }
  }

  return {
    state: {
      isPlaying: store.isPlaying,
      isPaused: store.isPaused,
      currentRound: store.currentRound,
      totalRounds: store.totalRounds,
      nLevel: store.nLevel,
      sequence: store.sequence,
      currentStimulusIndex: store.currentStimulusIndex,
      gamePhase: store.gamePhase,
      waitingForResponse: store.waitingForResponse,
      responseDeadline: store.responseDeadline,
      responses: store.responses,
      score: store.score,
      gameStartTime: store.gameStartTime,
      gameEndTime: store.gameEndTime,
      feedback: store.feedback,
    },
    settings: store.settings,
    currentStimulus: store.currentStimulus(),
    startGame: store.startGame,
    pauseGame: store.pauseGame,
    resumeGame: store.resumeGame,
    stopGame: store.stopGame,
    submitResponse,
    updateSettings: store.updateSettings,
    resetGame: store.resetGame,
  }
}

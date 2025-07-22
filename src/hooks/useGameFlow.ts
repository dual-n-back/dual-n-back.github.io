import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

export const useGameFlow = () => {
  const {
    isPlaying,
    isPaused,
    gamePhase,
    waitingForResponse,
    settings,
    waitForResponse,
    nextStimulus,
    submitResponse,
  } = useGameStore()

  // Game flow management
  useEffect(() => {
    if (!isPlaying || isPaused || gamePhase === 'preparation') return

    let timer: ReturnType<typeof setTimeout>

    if (gamePhase === 'stimulus') {
      // Show stimulus for specified duration, then wait for response or advance
      timer = setTimeout(() => {
        waitForResponse()
      }, settings.stimulusDuration)
    } else if (gamePhase === 'response') {
      // Wait for response or timeout
      timer = setTimeout(() => {
        // No response given, treat as no match for both modalities
        submitResponse()
      }, 3000) // 3 second response window
    } else if (gamePhase === 'feedback') {
      // Brief pause before next stimulus
      timer = setTimeout(() => {
        nextStimulus()
      }, 500)
    } else if (gamePhase === 'waiting') {
      // Brief pause between stimuli (for early stimuli that don't need response)
      timer = setTimeout(() => {
        nextStimulus()
      }, settings.interstimulusInterval)
    }

    return () => clearTimeout(timer)
  }, [gamePhase, isPlaying, isPaused, settings.stimulusDuration, settings.interstimulusInterval, waitForResponse, nextStimulus, submitResponse])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPlaying || !waitingForResponse) return

      switch (event.key.toLowerCase()) {
        case 'a': // Left arrow or A key for position match
        case 'arrowleft':
          if (settings.showVisual) {
            submitResponse('position')
          }
          break
        case 'l': // Right arrow or L key for audio match  
        case 'arrowright':
          if (settings.showAudio) {
            submitResponse('audio')
          }
          break
        case ' ': // Spacebar for no match
        case 'n':
          submitResponse()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, waitingForResponse, settings.showVisual, settings.showAudio, submitResponse])
}

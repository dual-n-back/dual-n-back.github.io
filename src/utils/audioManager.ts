import { AudioTone } from '../types/game'

// Audio context for Web Audio API
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null

// Predefined audio tones
const audioTones: AudioTone[] = [
  { frequency: 261.63, type: 'sine', name: 'C4' },    // C4
  { frequency: 293.66, type: 'sine', name: 'D4' },    // D4
  { frequency: 329.63, type: 'sine', name: 'E4' },    // E4
  { frequency: 349.23, type: 'sine', name: 'F4' },    // F4
  { frequency: 392.00, type: 'sine', name: 'G4' },    // G4
  { frequency: 440.00, type: 'sine', name: 'A4' },    // A4
  { frequency: 493.88, type: 'sine', name: 'B4' },    // B4
  { frequency: 523.25, type: 'sine', name: 'C5' },    // C5
]

// Spoken letters for audio mode
const spokenLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const spokenNumbers = ['1', '2', '3', '4', '5', '6', '7', '8']

/**
 * Initialize the audio context and master gain
 */
const initializeAudioContext = (): void => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = audioContext.createGain()
    masterGain.connect(audioContext.destination)
    masterGain.gain.value = 0.5 // Default volume
  }
}

/**
 * Resume audio context if it's suspended (required by some browsers)
 */
const resumeAudioContext = async (): Promise<void> => {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}

/**
 * Play a tone using Web Audio API
 */
export const playTone = async (
  toneIndex: number,
  duration: number = 500,
  volume: number = 0.5
): Promise<void> => {
  if (toneIndex < 0 || toneIndex >= audioTones.length) {
    console.warn(`Invalid tone index: ${toneIndex}`)
    return
  }

  try {
    initializeAudioContext()
    await resumeAudioContext()

    if (!audioContext || !masterGain) {
      throw new Error('Audio context not available')
    }

    const tone = audioTones[toneIndex]
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Connect oscillator -> gain -> master gain -> destination
    oscillator.connect(gainNode)
    gainNode.connect(masterGain)

    // Configure oscillator
    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.frequency, audioContext.currentTime)

    // Configure gain envelope (fade in/out to prevent clicks)
    const now = audioContext.currentTime
    const fadeDuration = 0.01 // 10ms fade
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + fadeDuration)
    gainNode.gain.setValueAtTime(volume, now + duration / 1000 - fadeDuration)
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000)

    // Start and stop oscillator
    oscillator.start(now)
    oscillator.stop(now + duration / 1000)

    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch (error) {
    console.error('Error playing tone:', error)
  }
}

/**
 * Play spoken letter using Speech Synthesis API
 */
export const playSpokenLetter = (
  letterIndex: number,
  volume: number = 0.5
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (letterIndex < 0 || letterIndex >= spokenLetters.length) {
      reject(new Error(`Invalid letter index: ${letterIndex}`))
      return
    }

    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(spokenLetters[letterIndex])
      utterance.volume = volume
      utterance.rate = 1.2
      utterance.pitch = 1.0
      
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Play spoken number using Speech Synthesis API
 */
export const playSpokenNumber = (
  numberIndex: number,
  volume: number = 0.5
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (numberIndex < 0 || numberIndex >= spokenNumbers.length) {
      reject(new Error(`Invalid number index: ${numberIndex}`))
      return
    }

    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(spokenNumbers[numberIndex])
      utterance.volume = volume
      utterance.rate = 1.2
      utterance.pitch = 1.0
      
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Play audio based on type and index
 */
export const playAudioTone = async (
  audioIndex: number,
  audioType: 'tones' | 'letters' | 'numbers' = 'tones',
  duration: number = 500,
  volume: number = 0.5
): Promise<void> => {
  try {
    switch (audioType) {
      case 'tones':
        await playTone(audioIndex, duration, volume)
        break
      case 'letters':
        await playSpokenLetter(audioIndex, volume)
        break
      case 'numbers':
        await playSpokenNumber(audioIndex, volume)
        break
      default:
        throw new Error(`Unknown audio type: ${audioType}`)
    }
  } catch (error) {
    console.error('Error playing audio:', error)
  }
}

/**
 * Set master volume
 */
export const setMasterVolume = (volume: number): void => {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume))
  }
}

/**
 * Get available audio tones
 */
export const getAudioTones = (): AudioTone[] => {
  return [...audioTones]
}

/**
 * Get available spoken letters
 */
export const getSpokenLetters = (): string[] => {
  return [...spokenLetters]
}

/**
 * Get available spoken numbers
 */
export const getSpokenNumbers = (): string[] => {
  return [...spokenNumbers]
}

/**
 * Test audio functionality
 */
export const testAudio = async (
  audioType: 'tones' | 'letters' | 'numbers' = 'tones',
  volume: number = 0.5
): Promise<boolean> => {
  try {
    await playAudioTone(0, audioType, 500, volume)
    return true
  } catch (error) {
    console.error('Audio test failed:', error)
    return false
  }
}

/**
 * Preload audio context (call on user interaction)
 */
export const preloadAudio = async (): Promise<void> => {
  try {
    initializeAudioContext()
    await resumeAudioContext()
  } catch (error) {
    console.error('Failed to preload audio:', error)
  }
}

/**
 * Clean up audio resources
 */
export const cleanupAudio = (): void => {
  if (speechSynthesis) {
    speechSynthesis.cancel()
  }
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
    masterGain = null
  }
}

import { AudioTone } from '../types/game'

// Audio context for Web Audio API
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null

// Voice selection for speech synthesis
let preferredVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false

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
 * Load and select the best available female voice
 */
const loadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (voicesLoaded && preferredVoice) {
      resolve()
      return
    }

    const selectBestVoice = () => {
      const voices = speechSynthesis.getVoices()
      
      if (voices.length === 0) {
        // Voices not loaded yet, try again
        setTimeout(selectBestVoice, 100)
        return
      }

      // Priority order for voice selection (female voices preferred)
      const voicePreferences = [
        // High-quality female voices
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('samantha') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('karen') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('victoria') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('susan') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('allison') && v.lang.startsWith('en'),
        
        // Google voices (usually high quality)
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en') && !v.name.toLowerCase().includes('male'),
        
        // Microsoft voices
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('microsoft') && v.name.toLowerCase().includes('female') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('zira') && v.lang.startsWith('en'),
        
        // Any female voice in English
        (v: SpeechSynthesisVoice) => (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')) && v.lang.startsWith('en'),
        
        // Fallback to any English voice
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.default,
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ]

      for (const preference of voicePreferences) {
        const voice = voices.find(preference)
        if (voice) {
          preferredVoice = voice
          voicesLoaded = true
          console.log(`Selected voice: ${voice.name} (${voice.lang})`)
          resolve()
          return
        }
      }

      // Ultimate fallback
      preferredVoice = voices[0] || null
      voicesLoaded = true
      resolve()
    }

    // Start voice selection
    selectBestVoice()

    // Also listen for voice changes (some browsers load voices asynchronously)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = selectBestVoice
    }
  })
}

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
 * Play spoken letter using Speech Synthesis API with improved voice and timing
 */
export const playSpokenLetter = async (
  letterIndex: number,
  volume: number = 0.5
): Promise<void> => {
  if (letterIndex < 0 || letterIndex >= spokenLetters.length) {
    throw new Error(`Invalid letter index: ${letterIndex}`)
  }

  if (!('speechSynthesis' in window)) {
    throw new Error('Speech synthesis not supported')
  }

  // Ensure voices are loaded and preferred voice is selected
  await loadVoices()

  // Cancel any ongoing speech to prevent overlapping
  speechSynthesis.cancel()

  // Small delay to ensure clean start
  await new Promise(resolve => setTimeout(resolve, 50))

  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(spokenLetters[letterIndex])
      
      // Use preferred voice if available
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      // Optimize speech parameters for clarity
      utterance.volume = Math.max(0, Math.min(1, volume))
      utterance.rate = 0.9  // Slightly slower for better pronunciation
      utterance.pitch = 1.1 // Slightly higher pitch for female voice
      utterance.lang = 'en-US' // Explicit language setting
      
      let resolved = false
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          speechSynthesis.cancel()
          resolve()
        }
      }, 2000) // 2 second timeout to prevent hanging
      
      utterance.onstart = () => {
        console.log(`Speaking letter: ${spokenLetters[letterIndex]}`)
      }
      
      utterance.onend = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          resolve()
        }
      }
      
      utterance.onerror = (event) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          console.warn(`Speech synthesis error: ${event.error}`)
          resolve() // Resolve instead of reject to prevent game breaking
        }
      }
      
      // Start speaking with a small delay to ensure readiness
      // Extra delay for the first letters to prevent cutoff
      const delay = spokenLetters[letterIndex] === 'A' ? 200 : 100
      setTimeout(() => {
        // Ensure speech synthesis is ready
        if (speechSynthesis.paused) {
          speechSynthesis.resume()
        }
        speechSynthesis.speak(utterance)
      }, delay)
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Play spoken number using Speech Synthesis API with improved voice and timing
 */
export const playSpokenNumber = async (
  numberIndex: number,
  volume: number = 0.5
): Promise<void> => {
  if (numberIndex < 0 || numberIndex >= spokenNumbers.length) {
    throw new Error(`Invalid number index: ${numberIndex}`)
  }

  if (!('speechSynthesis' in window)) {
    throw new Error('Speech synthesis not supported')
  }

  // Ensure voices are loaded and preferred voice is selected
  await loadVoices()

  // Cancel any ongoing speech to prevent overlapping
  speechSynthesis.cancel()

  // Small delay to ensure clean start
  await new Promise(resolve => setTimeout(resolve, 50))

  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(spokenNumbers[numberIndex])
      
      // Use preferred voice if available
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      // Optimize speech parameters for clarity
      utterance.volume = Math.max(0, Math.min(1, volume))
      utterance.rate = 0.9  // Slightly slower for better pronunciation
      utterance.pitch = 1.1 // Slightly higher pitch for female voice
      utterance.lang = 'en-US' // Explicit language setting
      
      let resolved = false
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          speechSynthesis.cancel()
          resolve()
        }
      }, 2000) // 2 second timeout to prevent hanging
      
      utterance.onstart = () => {
        console.log(`Speaking number: ${spokenNumbers[numberIndex]}`)
      }
      
      utterance.onend = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          resolve()
        }
      }
      
      utterance.onerror = (event) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          console.warn(`Speech synthesis error: ${event.error}`)
          resolve() // Resolve instead of reject to prevent game breaking
        }
      }
      
      // Start speaking with a small delay to ensure readiness
      // Extra delay for the first numbers to prevent cutoff
      const delay = spokenNumbers[numberIndex] === '1' ? 200 : 100
      setTimeout(() => {
        // Ensure speech synthesis is ready
        if (speechSynthesis.paused) {
          speechSynthesis.resume()
        }
        speechSynthesis.speak(utterance)
      }, delay)
      
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
 * Get information about the selected voice
 */
export const getSelectedVoiceInfo = (): { name: string; lang: string } | null => {
  if (preferredVoice) {
    return {
      name: preferredVoice.name,
      lang: preferredVoice.lang
    }
  }
  return null
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
 * Preload audio context and voices (call on user interaction)
 */
export const preloadAudio = async (): Promise<void> => {
  try {
    initializeAudioContext()
    await resumeAudioContext()
    await loadVoices() // Also preload the best voice
  } catch (error) {
    console.error('Failed to preload audio:', error)
  }
}

/**
 * Pre-warm speech synthesis to prevent first letter cutoff
 */
export const prewarmSpeechSynthesis = async (): Promise<void> => {
  if (!voicesLoaded || !preferredVoice) {
    await loadVoices()
  }
  
  return new Promise((resolve) => {
    // Create a silent, very short utterance to warm up the speech engine
    const warmupUtterance = new SpeechSynthesisUtterance('')
    warmupUtterance.volume = 0 // Silent
    warmupUtterance.rate = 2.0 // Very fast
    
    if (preferredVoice) {
      warmupUtterance.voice = preferredVoice
    }
    
    warmupUtterance.onend = () => resolve()
    warmupUtterance.onerror = () => resolve() // Continue even if error
    
    // Cancel any previous speech and start warmup
    speechSynthesis.cancel()
    speechSynthesis.speak(warmupUtterance)
    
    // Fallback timeout
    setTimeout(resolve, 500)
  })
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

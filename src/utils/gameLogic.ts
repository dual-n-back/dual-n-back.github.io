import { GameSequence } from '../types/game'

/**
 * Generates a random game sequence for the Dual N-Back game
 */
export const generateGameSequence = (length: number, gridSize: number): GameSequence[] => {
  const sequence: GameSequence[] = []
  const maxPosition = gridSize * gridSize - 1
  const maxAudio = 7 // 8 different audio tones (0-7)

  for (let i = 0; i < length; i++) {
    sequence.push({
      position: Math.floor(Math.random() * (maxPosition + 1)),
      audio: Math.floor(Math.random() * (maxAudio + 1)),
      timestamp: Date.now() + i * 3000, // 3 second intervals
    })
  }

  return sequence
}

/**
 * Calculates if there should be a match for position at current index
 */
export const shouldPositionMatch = (
  sequence: GameSequence[],
  currentIndex: number,
  nLevel: number
): boolean => {
  const nBackIndex = currentIndex - nLevel
  if (nBackIndex < 0) return false
  return sequence[currentIndex].position === sequence[nBackIndex].position
}

/**
 * Calculates if there should be a match for audio at current index
 */
export const shouldAudioMatch = (
  sequence: GameSequence[],
  currentIndex: number,
  nLevel: number
): boolean => {
  const nBackIndex = currentIndex - nLevel
  if (nBackIndex < 0) return false
  return sequence[currentIndex].audio === sequence[nBackIndex].audio
}

/**
 * Converts grid position index to row/col coordinates
 */
export const indexToRowCol = (index: number, gridSize: number) => {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  }
}

/**
 * Converts row/col coordinates to grid position index
 */
export const rowColToIndex = (row: number, col: number, gridSize: number) => {
  return row * gridSize + col
}

/**
 * Calculates the accuracy percentage from score data
 */
export const calculateAccuracy = (correct: number, incorrect: number): number => {
  const total = correct + incorrect
  if (total === 0) return 0
  return (correct / total) * 100
}

/**
 * Calculates the overall game score
 */
export const calculateGameScore = (score: {
  positionCorrect: number
  positionIncorrect: number
  audioCorrect: number
  audioIncorrect: number
}): number => {
  const totalCorrect = score.positionCorrect + score.audioCorrect
  const totalIncorrect = score.positionIncorrect + score.audioIncorrect
  return calculateAccuracy(totalCorrect, totalIncorrect)
}

/**
 * Formats time duration in milliseconds to human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Formats a number to a fixed number of decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Generates a unique ID for game sessions
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validates if N-back level is reasonable
 */
export const isValidNLevel = (nLevel: number): boolean => {
  return Number.isInteger(nLevel) && nLevel >= 1 && nLevel <= 10
}

/**
 * Calculates recommended N-level based on recent performance
 */
export const calculateRecommendedNLevel = (
  nLevelProgress: Record<number, {
    gamesPlayed: number
    averageScore: number
    bestScore: number
    lastPlayed: number
  }>
): number => {
  const levels = Object.keys(nLevelProgress).map(Number).sort((a, b) => b - a)
  
  if (levels.length === 0) return 2 // Default starting level

  for (const level of levels) {
    const progress = nLevelProgress[level]
    if (progress.gamesPlayed >= 3 && progress.averageScore >= 80) {
      // If performing well at this level, recommend next level
      return Math.min(level + 1, 10)
    }
  }

  // If not performing well at any level, recommend current highest level
  return levels[0]
}

/**
 * Determines difficulty level based on N-back level
 */
export const getDifficultyLevel = (nLevel: number): string => {
  if (nLevel <= 2) return 'Beginner'
  if (nLevel <= 4) return 'Intermediate'
  if (nLevel <= 6) return 'Advanced'
  return 'Expert'
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Debounce function to limit the frequency of function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

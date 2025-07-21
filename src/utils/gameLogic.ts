import { GameSequence } from '../types/game'

/**
 * Generates an engaging game sequence for the Dual N-Back game with balanced match opportunities
 * Based on research from dual n-back studies showing optimal engagement requires:
 * - 25-35% match rate for position
 * - 25-35% match rate for audio  
 * - Alternating opportunities to maintain active engagement
 * - Strategic distribution to avoid long periods without matches
 */
export const generateGameSequence = (length: number, gridSize: number, nLevel: number = 2): GameSequence[] => {
  const sequence: GameSequence[] = []
  const maxPosition = gridSize * gridSize - 1
  const maxAudio = 7 // 8 different audio tones (0-7)
  
  // Target match rates for optimal engagement (research-based)
  const targetPositionMatchRate = 0.30 // 30% position matches
  const targetAudioMatchRate = 0.30 // 30% audio matches
  
  // Calculate target number of matches
  const eligibleStimuli = Math.max(0, length - nLevel) // Can't have matches in first n stimuli
  const targetPositionMatches = Math.round(eligibleStimuli * targetPositionMatchRate)
  const targetAudioMatches = Math.round(eligibleStimuli * targetAudioMatchRate)
  
  // Initialize with random values for first n stimuli (no matches possible)
  for (let i = 0; i < Math.min(nLevel, length); i++) {
    sequence.push({
      position: Math.floor(Math.random() * (maxPosition + 1)),
      audio: Math.floor(Math.random() * (maxAudio + 1)),
      timestamp: Date.now() + i * 3000,
    })
  }
  
  // Generate remaining stimuli with strategic match placement
  if (length > nLevel) {
    const remainingIndices = Array.from({ length: eligibleStimuli }, (_, i) => i + nLevel)
    
    // Shuffle indices for random distribution
    const shuffledIndices = shuffleArray([...remainingIndices])
    
    // Select indices for position and audio matches
    const positionMatchIndices = new Set(shuffledIndices.slice(0, targetPositionMatches))
    const audioMatchIndices = new Set(shuffledIndices.slice(targetPositionMatches, targetPositionMatches + targetAudioMatches))
    
    // Try to minimize overlap for better engagement distribution
    const overlapCount = [...positionMatchIndices].filter(i => audioMatchIndices.has(i)).length
    if (overlapCount > Math.min(targetPositionMatches, targetAudioMatches) * 0.3) {
      // Redistribute overlapping indices
      const availableIndices = shuffledIndices.slice(targetPositionMatches + targetAudioMatches)
      let redistributed = 0
      for (const index of [...audioMatchIndices]) {
        if (positionMatchIndices.has(index) && redistributed < availableIndices.length) {
          audioMatchIndices.delete(index)
          audioMatchIndices.add(availableIndices[redistributed])
          redistributed++
        }
      }
    }
    
    // Generate stimuli for remaining positions
    for (let i = nLevel; i < length; i++) {
      const shouldPositionMatch = positionMatchIndices.has(i)
      const shouldAudioMatch = audioMatchIndices.has(i)
      
      let position: number
      let audio: number
      
      if (shouldPositionMatch) {
        position = sequence[i - nLevel].position
      } else {
        // Ensure no accidental match
        do {
          position = Math.floor(Math.random() * (maxPosition + 1))
        } while (position === sequence[i - nLevel].position)
      }
      
      if (shouldAudioMatch) {
        audio = sequence[i - nLevel].audio
      } else {
        // Ensure no accidental match
        do {
          audio = Math.floor(Math.random() * (maxAudio + 1))
        } while (audio === sequence[i - nLevel].audio)
      }
      
      sequence.push({
        position,
        audio,
        timestamp: Date.now() + i * 3000,
      })
    }
  }
  
  return sequence
}

/**
 * Generates an advanced engaging sequence with adaptive patterns
 * This creates sequences that maintain user engagement through:
 * - Alternating match types to prevent monotony
 * - Controlled difficulty progression within the sequence
 * - Strategic spacing to avoid long idle periods
 */
export const generateEngagingSequence = (
  length: number, 
  gridSize: number, 
  nLevel: number = 2,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): GameSequence[] => {
  const sequence: GameSequence[] = []
  const maxPosition = gridSize * gridSize - 1
  const maxAudio = 7
  
  // Difficulty-based match rates for optimal engagement
  const difficultySettings = {
    easy: { position: 0.35, audio: 0.35, maxConsecutive: 1, minGap: 2 },
    medium: { position: 0.30, audio: 0.30, maxConsecutive: 2, minGap: 1 },
    hard: { position: 0.25, audio: 0.25, maxConsecutive: 3, minGap: 1 }
  }
  
  const settings = difficultySettings[difficulty]
  const eligibleStimuli = Math.max(0, length - nLevel)
  
  // Initialize first n stimuli (no matches possible)
  for (let i = 0; i < Math.min(nLevel, length); i++) {
    sequence.push({
      position: Math.floor(Math.random() * (maxPosition + 1)),
      audio: Math.floor(Math.random() * (maxAudio + 1)),
      timestamp: Date.now() + i * 3000,
    })
  }
  
  if (length <= nLevel) return sequence
  
  // Calculate target matches
  const targetPositionMatches = Math.round(eligibleStimuli * settings.position)
  const targetAudioMatches = Math.round(eligibleStimuli * settings.audio)
  
  // Create engagement pattern: alternate between position and audio focus
  const matchPattern = createEngagementPattern(
    eligibleStimuli, 
    targetPositionMatches, 
    targetAudioMatches,
    settings.maxConsecutive,
    settings.minGap
  )
  
  // Generate remaining stimuli following the engagement pattern
  for (let i = nLevel; i < length; i++) {
    const patternIndex = i - nLevel
    const shouldPositionMatch = matchPattern.position[patternIndex]
    const shouldAudioMatch = matchPattern.audio[patternIndex]
    
    let position: number
    let audio: number
    
    if (shouldPositionMatch) {
      position = sequence[i - nLevel].position
    } else {
      // Ensure no accidental match while maintaining variety
      const usedPositions = sequence.slice(Math.max(0, i - nLevel * 2), i).map(s => s.position)
      do {
        position = Math.floor(Math.random() * (maxPosition + 1))
      } while (position === sequence[i - nLevel].position || 
               (usedPositions.filter(p => p === position).length > 1))
    }
    
    if (shouldAudioMatch) {
      audio = sequence[i - nLevel].audio
    } else {
      // Ensure no accidental match while maintaining variety
      const usedAudios = sequence.slice(Math.max(0, i - nLevel * 2), i).map(s => s.audio)
      do {
        audio = Math.floor(Math.random() * (maxAudio + 1))
      } while (audio === sequence[i - nLevel].audio || 
               (usedAudios.filter(a => a === audio).length > 1))
    }
    
    sequence.push({
      position,
      audio,
      timestamp: Date.now() + i * 3000,
    })
  }
  
  return sequence
}

/**
 * Creates an engagement pattern that alternates between position and audio matches
 * while maintaining optimal spacing and avoiding long periods without user interaction
 */
const createEngagementPattern = (
  length: number,
  positionMatches: number,
  audioMatches: number,
  maxConsecutive: number,
  minGap: number
): { position: boolean[], audio: boolean[] } => {
  const position = new Array(length).fill(false)
  const audio = new Array(length).fill(false)
  
  // Place position matches with strategic spacing
  let placedPosition = 0
  let consecutivePosition = 0
  for (let i = 0; i < length && placedPosition < positionMatches; i++) {
    if (consecutivePosition < maxConsecutive && 
        (!position[i - 1] || consecutivePosition === 0) &&
        (i === 0 || !needsGap(position, i, minGap))) {
      
      // Prefer positions that alternate with audio opportunities
      const hasRecentAudio = audio.slice(Math.max(0, i - 3), i).some(a => a)
      const willHaveAudio = i < length - 3
      
      if (!hasRecentAudio || willHaveAudio || Math.random() > 0.3) {
        position[i] = true
        placedPosition++
        consecutivePosition++
      }
    } else {
      consecutivePosition = 0
    }
  }
  
  // Place audio matches with strategic spacing, avoiding position overlap where possible
  let placedAudio = 0
  let consecutiveAudio = 0
  for (let i = 0; i < length && placedAudio < audioMatches; i++) {
    if (!position[i] && // Prefer non-overlapping positions for better engagement
        consecutiveAudio < maxConsecutive && 
        (!audio[i - 1] || consecutiveAudio === 0) &&
        (i === 0 || !needsGap(audio, i, minGap))) {
      
      audio[i] = true
      placedAudio++
      consecutiveAudio++
    } else if (position[i]) {
      consecutiveAudio = 0
    } else if (consecutiveAudio >= maxConsecutive) {
      consecutiveAudio = 0
    }
  }
  
  // Fill remaining audio matches if needed
  if (placedAudio < audioMatches) {
    for (let i = 0; i < length && placedAudio < audioMatches; i++) {
      if (!audio[i] && !needsGap(audio, i, minGap)) {
        audio[i] = true
        placedAudio++
      }
    }
  }
  
  return { position, audio }
}

/**
 * Checks if a position needs a gap based on minimum spacing requirements
 */
const needsGap = (pattern: boolean[], index: number, minGap: number): boolean => {
  for (let i = Math.max(0, index - minGap); i < index; i++) {
    if (pattern[i]) return true
  }
  return false
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

/**
 * Calculates engagement metrics for a completed game sequence
 * This helps analyze how well the sequence maintained user engagement
 */
export const calculateEngagementMetrics = (
  sequence: GameSequence[],
  responses: any[],
  nLevel: number
): {
  actualPositionMatchRate: number
  actualAudioMatchRate: number
  responseRate: number
  engagementScore: number
  idlePeriods: number
  maxIdlePeriod: number
} => {
  if (sequence.length <= nLevel) {
    return {
      actualPositionMatchRate: 0,
      actualAudioMatchRate: 0,
      responseRate: 0,
      engagementScore: 0,
      idlePeriods: 0,
      maxIdlePeriod: 0
    }
  }

  let positionMatches = 0
  let audioMatches = 0
  const eligibleStimuli = sequence.length - nLevel

  // Count actual matches in the sequence
  for (let i = nLevel; i < sequence.length; i++) {
    if (shouldPositionMatch(sequence, i, nLevel)) {
      positionMatches++
    }
    if (shouldAudioMatch(sequence, i, nLevel)) {
      audioMatches++
    }
  }

  // Calculate response rate
  const totalPossibleResponses = responses.length
  const actualResponses = responses.filter(r => r.position !== null || r.audio !== null).length
  const responseRate = totalPossibleResponses > 0 ? actualResponses / totalPossibleResponses : 0

  // Calculate idle periods (consecutive stimuli without matches)
  let idlePeriods = 0
  let currentIdlePeriod = 0
  let maxIdlePeriod = 0

  for (let i = nLevel; i < sequence.length; i++) {
    const hasPositionMatch = shouldPositionMatch(sequence, i, nLevel)
    const hasAudioMatch = shouldAudioMatch(sequence, i, nLevel)
    
    if (!hasPositionMatch && !hasAudioMatch) {
      currentIdlePeriod++
      maxIdlePeriod = Math.max(maxIdlePeriod, currentIdlePeriod)
    } else {
      if (currentIdlePeriod >= 3) { // Count sequences of 3+ as idle periods
        idlePeriods++
      }
      currentIdlePeriod = 0
    }
  }

  // Final idle period check
  if (currentIdlePeriod >= 3) {
    idlePeriods++
  }

  // Calculate overall engagement score (higher is better)
  const idealMatchRate = 0.3
  const positionMatchDiff = Math.abs((positionMatches / eligibleStimuli) - idealMatchRate)
  const audioMatchDiff = Math.abs((audioMatches / eligibleStimuli) - idealMatchRate)
  const matchBalance = 1 - (positionMatchDiff + audioMatchDiff) / 2
  const idlePenalty = Math.max(0, 1 - (idlePeriods * 0.1) - (maxIdlePeriod * 0.05))
  
  const engagementScore = (matchBalance * 0.4 + responseRate * 0.4 + idlePenalty * 0.2) * 100

  return {
    actualPositionMatchRate: positionMatches / eligibleStimuli,
    actualAudioMatchRate: audioMatches / eligibleStimuli,
    responseRate,
    engagementScore,
    idlePeriods,
    maxIdlePeriod
  }
}

/**
 * Analyzes the distribution pattern of matches in a sequence
 * Helps understand if matches are well-distributed or clustered
 */
export const analyzeMatchDistribution = (
  sequence: GameSequence[],
  nLevel: number
): {
  positionMatchSpacing: number[]
  audioMatchSpacing: number[]
  averagePositionSpacing: number
  averageAudioSpacing: number
  distributionScore: number
} => {
  const positionMatches: number[] = []
  const audioMatches: number[] = []

  // Find all match positions
  for (let i = nLevel; i < sequence.length; i++) {
    if (shouldPositionMatch(sequence, i, nLevel)) {
      positionMatches.push(i)
    }
    if (shouldAudioMatch(sequence, i, nLevel)) {
      audioMatches.push(i)
    }
  }

  // Calculate spacing between matches
  const positionSpacing = positionMatches.map((pos, i) => 
    i === 0 ? pos - nLevel : pos - positionMatches[i - 1]
  )
  const audioSpacing = audioMatches.map((pos, i) => 
    i === 0 ? pos - nLevel : pos - audioMatches[i - 1]
  )

  const avgPositionSpacing = positionSpacing.length > 0 
    ? positionSpacing.reduce((a, b) => a + b, 0) / positionSpacing.length 
    : 0
  const avgAudioSpacing = audioSpacing.length > 0 
    ? audioSpacing.reduce((a, b) => a + b, 0) / audioSpacing.length 
    : 0

  // Calculate distribution score (lower variance = better distribution)
  const positionVariance = positionSpacing.length > 1 
    ? positionSpacing.reduce((acc, spacing) => acc + Math.pow(spacing - avgPositionSpacing, 2), 0) / positionSpacing.length
    : 0
  const audioVariance = audioSpacing.length > 1 
    ? audioSpacing.reduce((acc, spacing) => acc + Math.pow(spacing - avgAudioSpacing, 2), 0) / audioSpacing.length
    : 0

  // Normalize distribution score (0-100, higher is better)
  const maxExpectedVariance = 4 // Reasonable threshold for good distribution
  const distributionScore = 100 * Math.max(0, 1 - ((positionVariance + audioVariance) / 2) / maxExpectedVariance)

  return {
    positionMatchSpacing: positionSpacing,
    audioMatchSpacing: audioSpacing,
    averagePositionSpacing: avgPositionSpacing,
    averageAudioSpacing: avgAudioSpacing,
    distributionScore
  }
}

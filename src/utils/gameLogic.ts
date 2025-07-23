import { GameSequence } from '../types/game'

/**
 * Represents a snapshot of user performance for adaptive difficulty calculation
 */
export interface PerformanceSnapshot {
  accuracy: number        // Overall accuracy percentage (0-100)
  responseTime: number    // Average response time in ms
  missedResponses: number // Number of missed responses in this window
  totalResponses: number  // Total possible responses in this window
  timestamp: number       // When this snapshot was taken
  difficulty: number      // Current difficulty level (1-10)
}

/**
 * Adaptive difficulty adjustments based on performance analysis
 */
export interface AdaptiveAdjustments {
  matchRateMultiplier: number    // Multiply base match rates (0.5 to 1.5)
  complexityBonus: number        // Add/subtract from overlap bonus (-0.1 to +0.2)
  pacingAdjustment: number       // Adjust gap requirements (-1 to +2)
  confidenceLevel: number        // How confident we are in these adjustments (0-1)
}

/**
 * Creates a performance snapshot from current game state
 * Now calculates all metrics from consistent recent time window for accurate adaptive decisions
 */
export const createPerformanceSnapshot = (
  responses: any[],
  currentRound: number,
  timeWindow: number = 5
): PerformanceSnapshot => {
  const recentResponses = responses.slice(-timeWindow)
  if (recentResponses.length === 0) {
    return {
      accuracy: 0,
      responseTime: 0,
      missedResponses: 0,
      totalResponses: 0,
      timestamp: Date.now(),
      difficulty: 1
    }
  }
  
  // Calculate recent performance metrics from the time window for consistent adaptive decisions
  // This ensures all snapshot data represents the same recent time period
  const recentCorrect = recentResponses.filter(r => r.correct === true).length
  const recentIncorrect = recentResponses.filter(r => r.correct === false && r.type).length
  const recentMissed = recentResponses.filter(r => r.correct === false && !r.type).length
  const recentTotalRounds = Math.min(timeWindow, currentRound)
  
  // Use comprehensive accuracy calculation for the recent window
  const accuracy = calculateAccuracy(recentCorrect, recentIncorrect, recentMissed, recentTotalRounds)
  
  // Missed responses from recent window only
  const missedResponses = recentMissed
  
  const responseTimes = recentResponses
    .filter(r => r.responseTime && r.responseTime > 0)
    .map(r => r.responseTime)
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0
  
  // Debug logging for performance snapshots
  console.log('📊 Performance Snapshot Created:', {
    accuracy: accuracy.toFixed(1) + '%',
    responseTime: avgResponseTime.toFixed(0) + 'ms',
    missedResponses,
    totalResponses: recentTotalRounds,
    timeWindow,
    recentResponsesCount: recentResponses.length,
    breakdown: {
      recentCorrect,
      recentIncorrect, 
      recentMissed
    },
    timestamp: new Date().toLocaleTimeString()
  })
  
  return {
    accuracy,
    responseTime: avgResponseTime,
    missedResponses,
    totalResponses: recentTotalRounds, // Use recent window size for consistent calculations
    timestamp: Date.now(),
    difficulty: 1 // This should be calculated based on current game settings
  }
}

/**
 * Generates an engaging game sequence for the Dual N-Back game with balanced match opportunities
 * Based on research from dual n-back studies showing optimal engagement requires:
 * - 25-35% match rate for position
 * - 25-35% match rate for audio  
 * - Alternating opportunities to maintain active engagement
 * - Strategic distribution to avoid long periods without matches
 */
export const generateGameSequence = (length: number, gridSize: number, nLevel: number = 2, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameSequence[] => {
  const sequence: GameSequence[] = []
  const maxPosition = gridSize * gridSize - 1
  const maxAudio = 7 // 8 audio sounds (0-7)

  // Difficulty-based match rates for optimal engagement
  const difficultySettings = {
    easy: { positionMatchRate: 0.28, audioMatchRate: 0.28, lureRate: 0.08 },
    medium: { positionMatchRate: 0.23, audioMatchRate: 0.23, lureRate: 0.12 },
    hard: { positionMatchRate: 0.20, audioMatchRate: 0.20, lureRate: 0.15 },
  }
  const settings = difficultySettings[difficulty]

  // Anti-clustering system: track recent values to ensure variety
  const recentPositions: number[] = []
  const recentAudios: number[] = []
  const antiClusterWindow = Math.min(4, Math.ceil(gridSize * 0.6)) // Dynamic window based on grid size

  /**
   * Modern anti-repetition generator using weighted selection
   * Prevents clustering while maintaining randomness
   */
  const generateAntiClusterValue = (
    maxValue: number, 
    excludeValue: number, 
    recentValues: number[]
  ): number => {
    // Create probability weights (higher = more likely to be selected)
    const weights = new Array(maxValue + 1).fill(1.0)
    
    // Reduce probability for excluded value
    if (excludeValue >= 0 && excludeValue <= maxValue) {
      weights[excludeValue] = 0
    }
    
    // Apply anti-clustering: reduce probability for recent values
    recentValues.forEach((value, index) => {
      if (value >= 0 && value <= maxValue) {
        // More recent values get stronger penalty
        const recencyFactor = (recentValues.length - index) / recentValues.length
        weights[value] *= Math.max(0.1, 1 - (recencyFactor * 0.7))
      }
    })
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i <= maxValue; i++) {
      random -= weights[i]
      if (random <= 0) {
        return i
      }
    }
    
    // Fallback (should rarely happen)
    return Math.floor(Math.random() * (maxValue + 1))
  }

  /**
   * Updates anti-clustering history with smart window management
   */
  const updateRecentValues = (value: number, recentArray: number[]) => {
    recentArray.push(value)
    if (recentArray.length > antiClusterWindow) {
      recentArray.shift()
    }
  }

  // Step 1: Generate initial non-matching sequence (first N items)
  for (let i = 0; i < nLevel; i++) {
    const position = generateAntiClusterValue(maxPosition, -1, recentPositions)
    const audio = generateAntiClusterValue(maxAudio, -1, recentAudios)
    
    sequence.push({
      position,
      audio,
      timestamp: 0 // Will be set during gameplay
    })
    
    updateRecentValues(position, recentPositions)
    updateRecentValues(audio, recentAudios)
  }

  // Step 2: Generate remaining sequence with dynamic, non-predictable approach
  const remainingLength = length - nLevel
  
  // Track recent match patterns to break up predictability
  let recentPositionMatches = 0
  let recentAudioMatches = 0
  let consecutiveNonMatches = 0
  const patternBreakWindow = Math.min(5, Math.ceil(remainingLength / 4))
  
  // Dynamic counters for balancing over the entire sequence
  let totalPositionMatches = 0
  let totalAudioMatches = 0
  const targetPositionMatches = Math.round(remainingLength * settings.positionMatchRate)
  const targetAudioMatches = Math.round(remainingLength * settings.audioMatchRate)

  // Step 3: Generate each stimulus dynamically with pattern-breaking logic
  for (let i = 0; i < remainingLength; i++) {
    const currentIndex = nLevel + i
    const nBackStimulus = sequence[currentIndex - nLevel]
    const remainingStimuli = remainingLength - i
    
    // Calculate dynamic probabilities based on current state and remaining needs
    let positionMatchProbability = 0
    let audioMatchProbability = 0
    
    // Adjust probability based on how many matches we still need
    const positionMatchesNeeded = targetPositionMatches - totalPositionMatches
    const audioMatchesNeeded = targetAudioMatches - totalAudioMatches
    
    if (positionMatchesNeeded > 0 && remainingStimuli > 0) {
      positionMatchProbability = Math.min(0.6, positionMatchesNeeded / remainingStimuli)
    }
    if (audioMatchesNeeded > 0 && remainingStimuli > 0) {
      audioMatchProbability = Math.min(0.6, audioMatchesNeeded / remainingStimuli)
    }
    
    // Pattern-breaking adjustments
    const recentWindow = Math.min(patternBreakWindow, i)
    if (recentWindow > 0) {
      const recentPositionRate = recentPositionMatches / recentWindow
      const recentAudioRate = recentAudioMatches / recentWindow
      
      // If we've had too many matches recently, reduce probability
      if (recentPositionRate > settings.positionMatchRate * 1.5) {
        positionMatchProbability *= 0.3
      }
      if (recentAudioRate > settings.audioMatchRate * 1.5) {
        audioMatchProbability *= 0.3
      }
      
      // If we've had too few matches recently, increase probability
      if (recentPositionRate < settings.positionMatchRate * 0.5 && positionMatchesNeeded > 0) {
        positionMatchProbability = Math.min(0.7, positionMatchProbability * 2)
      }
      if (recentAudioRate < settings.audioMatchRate * 0.5 && audioMatchesNeeded > 0) {
        audioMatchProbability = Math.min(0.7, audioMatchProbability * 2)
      }
    }
    
    // Prevent too many consecutive non-matches (engagement killer)
    if (consecutiveNonMatches >= 4) {
      if (positionMatchesNeeded > 0) positionMatchProbability = Math.max(0.4, positionMatchProbability)
      if (audioMatchesNeeded > 0) audioMatchProbability = Math.max(0.4, audioMatchProbability)
    }
    
    // Prevent simultaneous matches too often (but allow occasionally for challenge)
    if (Math.random() < positionMatchProbability && Math.random() < audioMatchProbability) {
      // Both would match - randomly pick one (bias towards audio for variety)
      if (Math.random() < 0.3) {
        // Allow both (creates challenge)
      } else if (Math.random() < 0.6) {
        positionMatchProbability = 0 // Keep audio match
      } else {
        audioMatchProbability = 0 // Keep position match
      }
    }
    
    // Add some randomness to break predictability
    const randomFactor = 0.7 + Math.random() * 0.6 // 0.7 to 1.3 multiplier
    positionMatchProbability *= randomFactor
    audioMatchProbability *= randomFactor
    
    // Final decision on matches
    const willPositionMatch = Math.random() < positionMatchProbability
    const willAudioMatch = Math.random() < audioMatchProbability
    
    let position: number
    let audio: number

    // Generate position
    if (willPositionMatch) {
      position = nBackStimulus.position
      totalPositionMatches++
      recentPositionMatches++
      consecutiveNonMatches = 0
    } else {
      // Add lure possibility for more challenge
      if (nLevel > 1 && Math.random() < settings.lureRate && !willAudioMatch) {
        const lureOffset = Math.random() < 0.7 ? 1 : 2
        const lureIndex = currentIndex - nLevel + lureOffset
        if (lureIndex >= 0 && lureIndex < sequence.length) {
          position = sequence[lureIndex].position
        } else {
          position = generateAntiClusterValue(maxPosition, nBackStimulus.position, recentPositions)
        }
      } else {
        position = generateAntiClusterValue(maxPosition, nBackStimulus.position, recentPositions)
      }
    }

    // Generate audio
    if (willAudioMatch) {
      audio = nBackStimulus.audio
      totalAudioMatches++
      recentAudioMatches++
      consecutiveNonMatches = 0
    } else {
      // Add lure possibility for more challenge
      if (nLevel > 1 && Math.random() < settings.lureRate && !willPositionMatch) {
        const lureOffset = Math.random() < 0.7 ? 1 : 2
        const lureIndex = currentIndex - nLevel + lureOffset
        if (lureIndex >= 0 && lureIndex < sequence.length) {
          audio = sequence[lureIndex].audio
        } else {
          audio = generateAntiClusterValue(maxAudio, nBackStimulus.audio, recentAudios)
        }
      } else {
        audio = generateAntiClusterValue(maxAudio, nBackStimulus.audio, recentAudios)
      }
    }
    
    // Track consecutive non-matches
    if (!willPositionMatch && !willAudioMatch) {
      consecutiveNonMatches++
    } else {
      consecutiveNonMatches = 0
    }
    
    // Update recent match tracking (sliding window)
    if (i >= patternBreakWindow) {
      // Remove the influence of the stimulus that's now outside our tracking window
      const oldIndex = currentIndex - patternBreakWindow
      const oldNBackIndex = oldIndex - nLevel
      if (oldNBackIndex >= 0) {
        const oldStimulus = sequence[oldIndex]
        const oldNBackStimulus = sequence[oldNBackIndex]
        if (oldStimulus.position === oldNBackStimulus.position) recentPositionMatches--
        if (oldStimulus.audio === oldNBackStimulus.audio) recentAudioMatches--
      }
    }

    sequence.push({
      position,
      audio,
      timestamp: 0 // Will be set during gameplay
    })

    updateRecentValues(position, recentPositions)
    updateRecentValues(audio, recentAudios)
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
 * Now includes correct non-responses (when user correctly didn't respond to non-matches)
 */
export const calculateAccuracy = (
  correct: number, 
  incorrect: number, 
  missed: number,
  totalRounds: number
): number => {
    const correctNonResponses = totalRounds - correct - incorrect - missed
    const totalSuccess = correct + Math.max(0, correctNonResponses)
    const totalAttempts = totalRounds
    if (totalAttempts === 0) return 0
    return (totalSuccess / totalAttempts) * 100
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
 * Analyzes performance trends to recommend when to trigger adaptive changes
 * Returns whether difficulty should be adjusted and how urgently
 */
export const analyzeAdaptiveTriggers = (
  performanceHistory: PerformanceSnapshot[],
  nLevel: number
): {
  shouldAdjust: boolean
  urgency: 'low' | 'medium' | 'high'
  reason: string
  recommendedAction: 'increase' | 'decrease' | 'maintain'
} => {
  if (performanceHistory.length < 3) {
    return {
      shouldAdjust: false,
      urgency: 'low',
      reason: 'Insufficient data for analysis',
      recommendedAction: 'maintain'
    }
  }
  
  const recent = performanceHistory.slice(-3)
  const avgAccuracy = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length
  const avgMissedRate = recent.reduce((sum, p) => sum + (p.missedResponses / p.totalResponses), 0) / recent.length
  
  // Define thresholds based on n-level
  const excellentThreshold = Math.max(85, 95 - nLevel * 2)
  const poorThreshold = Math.max(50, 65 - nLevel * 3)
  
  // Debug logging for adaptive trigger analysis
  console.log('🧠 Adaptive Trigger Analysis:', {
    nLevel,
    avgAccuracy: avgAccuracy.toFixed(1) + '%',
    avgMissedRate: (avgMissedRate * 100).toFixed(1) + '%',
    thresholds: {
      excellent: excellentThreshold + '%',
      poor: poorThreshold + '%'
    },
    recentSnapshots: recent.length,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Check for excellent performance (increase difficulty)
  if (avgAccuracy >= excellentThreshold && avgMissedRate < 0.1) {
    const result = {
      shouldAdjust: true,
      urgency: recent.every(p => p.accuracy >= excellentThreshold) ? 'high' as const : 'medium' as const,
      reason: `Excellent performance (${avgAccuracy.toFixed(1)}% accuracy)`,
      recommendedAction: 'increase' as const
    }
    console.log('🚀 Adaptive Decision: INCREASE DIFFICULTY', result)
    return result
  }
  
  // Check for poor performance (decrease difficulty)
  if (avgAccuracy <= poorThreshold || avgMissedRate > 0.4) {
    const result = {
      shouldAdjust: true,
      urgency: avgAccuracy <= poorThreshold - 10 ? 'high' as const : 'medium' as const,
      reason: `Poor performance (${avgAccuracy.toFixed(1)}% accuracy, ${(avgMissedRate * 100).toFixed(1)}% missed)`,
      recommendedAction: 'decrease' as const
    }
    console.log('📉 Adaptive Decision: DECREASE DIFFICULTY', result)
    return result
  }
  
  // Check for declining trend
  if (recent.length >= 3) {
    const trend = recent[recent.length - 1].accuracy - recent[0].accuracy
    if (trend < -15) {
      const result = {
        shouldAdjust: true,
        urgency: 'medium' as const,
        reason: `Declining performance trend (${trend.toFixed(1)}% drop)`,
        recommendedAction: 'decrease' as const
      }
      console.log('📉 Adaptive Decision: DECLINING TREND', result)
      return result
    }
  }
  
  const result = {
    shouldAdjust: false,
    urgency: 'low' as const,
    reason: 'Performance within acceptable range',
    recommendedAction: 'maintain' as const
  }
  console.log('✅ Adaptive Decision: MAINTAIN DIFFICULTY', result)
  return result
}

/**
 * USAGE EXAMPLE FOR GAME STORE INTEGRATION:
 * 
 * ```typescript
 * // In game store, replace static sequence generation with adaptive:
 * 
 * // Track performance history
 * const performanceHistory: PerformanceSnapshot[] = []
 * 
 * // During game, periodically create snapshots (every 3 responses for 15-round games)
 * if (responses.length % 3 === 0) {
 *   const snapshot = createPerformanceSnapshot(responses, currentRound, 5)
 *   performanceHistory.push(snapshot)
 * }
 * 
 * // Generate adaptive sequence
 * const sequence = generateAdaptiveSequence(
 *   settings.totalRounds,
 *   settings.gridSize,
 *   nLevel,
 *   difficulty,
 *   performanceHistory
 * )
 * 
 * // For real-time adjustments during gameplay:
 * const triggers = analyzeAdaptiveTriggers(performanceHistory, nLevel)
 * if (triggers.shouldAdjust && triggers.urgency === 'high') {
 *   // Regenerate remaining sequence with new difficulty
 * }
 * ```
 */

/**
 * Real-time probability tweak engine for dynamic difficulty adjustment
 * Modifies match probabilities based on immediate performance feedback
 */
export const calculateDynamicMatchProbabilities = (
  basePositionRate: number,
  baseAudioRate: number,
  recentResponses: any[],
  nLevel: number,
  windowSize: number = 5
): { position: number, audio: number, confidence: number } => {
  if (recentResponses.length < windowSize) {
    return {
      position: basePositionRate,
      audio: baseAudioRate,
      confidence: 0
    }
  }
  
  const window = recentResponses.slice(-windowSize)
  
  // Calculate recent performance metrics
  const positionCorrect = window.filter(r => r.position !== null && r.positionCorrect).length
  const positionIncorrect = window.filter(r => r.position !== null && !r.positionCorrect).length
  const positionMissed = window.filter(r => r.positionExpected && r.position === null).length
  
  const audioCorrect = window.filter(r => r.audio !== null && r.audioCorrect).length
  const audioIncorrect = window.filter(r => r.audio !== null && !r.audioCorrect).length
  const audioMissed = window.filter(r => r.audioExpected && r.audio === null).length
  
  // Calculate accuracy for each modality
  const positionAccuracy = (positionCorrect + positionIncorrect + positionMissed) > 0 
    ? positionCorrect / (positionCorrect + positionIncorrect + positionMissed)
    : 0.5
  const audioAccuracy = (audioCorrect + audioIncorrect + audioMissed) > 0
    ? audioCorrect / (audioCorrect + audioIncorrect + audioMissed)
    : 0.5
  
  // Define target accuracy based on n-level
  const targetAccuracy = Math.max(0.6, 0.8 - (nLevel - 2) * 0.05)
  
  // Calculate adjustments (more responsive than the segment-based approach)
  let positionAdjustment = 1.0
  let audioAdjustment = 1.0
  
  // Adjust based on performance vs target
  if (positionAccuracy > targetAccuracy + 0.2) {
    positionAdjustment = 1.0 + (positionAccuracy - targetAccuracy) * 0.5
  } else if (positionAccuracy < targetAccuracy - 0.2) {
    positionAdjustment = Math.max(0.5, 1.0 - (targetAccuracy - positionAccuracy) * 0.8)
  }
  
  if (audioAccuracy > targetAccuracy + 0.2) {
    audioAdjustment = 1.0 + (audioAccuracy - targetAccuracy) * 0.5
  } else if (audioAccuracy < targetAccuracy - 0.2) {
    audioAdjustment = Math.max(0.5, 1.0 - (targetAccuracy - audioAccuracy) * 0.8)
  }
  
  // Apply smoothing to prevent wild swings
  const smoothingFactor = 0.7
  positionAdjustment = basePositionRate * smoothingFactor + (basePositionRate * positionAdjustment) * (1 - smoothingFactor)
  audioAdjustment = baseAudioRate * smoothingFactor + (baseAudioRate * audioAdjustment) * (1 - smoothingFactor)
  
  return {
    position: Math.max(0.1, Math.min(0.5, positionAdjustment)),
    audio: Math.max(0.1, Math.min(0.5, audioAdjustment)),
    confidence: Math.min(1.0, window.length / windowSize)
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

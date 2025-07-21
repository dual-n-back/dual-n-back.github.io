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
 * Calculates adaptive difficulty adjustments based on performance history
 * Analyzes recent performance to determine how to modify difficulty
 */
const calculateAdaptiveAdjustments = (
  performanceHistory: PerformanceSnapshot[],
  nLevel: number
): AdaptiveAdjustments => {
  if (performanceHistory.length === 0) {
    return {
      matchRateMultiplier: 1.0,
      complexityBonus: 0,
      pacingAdjustment: 0,
      confidenceLevel: 0
    }
  }
  
  // Calculate recent performance trends
  const recentPerformance = performanceHistory.slice(-5) // Last 5 snapshots
  const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length
  const avgResponseTime = recentPerformance.reduce((sum, p) => sum + p.responseTime, 0) / recentPerformance.length
  const missedRate = recentPerformance.reduce((sum, p) => sum + (p.missedResponses / p.totalResponses), 0) / recentPerformance.length
  
  // Calculate performance trend (improving vs declining)
  let trend = 0
  if (recentPerformance.length >= 3) {
    const first = recentPerformance.slice(0, 2).reduce((sum, p) => sum + p.accuracy, 0) / 2
    const last = recentPerformance.slice(-2).reduce((sum, p) => sum + p.accuracy, 0) / 2
    trend = (last - first) / 100 // Normalize to -1 to +1
  }
  
  // Define performance targets based on n-level
  const targetAccuracy = Math.max(60, 85 - (nLevel - 2) * 5) // Higher n-levels have lower accuracy targets
  const maxResponseTime = 1500 + (nLevel - 2) * 200 // More time allowed for higher n-levels
  
  // Calculate adjustments
  let matchRateMultiplier = 1.0
  let complexityBonus = 0
  let pacingAdjustment = 0
  
  // Accuracy-based adjustments
  if (avgAccuracy > targetAccuracy + 15) {
    // Performance is excellent - increase difficulty
    matchRateMultiplier = Math.min(1.3, 1.0 + (avgAccuracy - targetAccuracy) / 100)
    complexityBonus = Math.min(0.15, (avgAccuracy - targetAccuracy) / 200)
    pacingAdjustment = Math.max(-1, -Math.floor((avgAccuracy - targetAccuracy) / 20))
  } else if (avgAccuracy < targetAccuracy - 15) {
    // Performance is poor - decrease difficulty
    matchRateMultiplier = Math.max(0.6, 1.0 - (targetAccuracy - avgAccuracy) / 150)
    complexityBonus = Math.max(-0.1, -(targetAccuracy - avgAccuracy) / 300)
    pacingAdjustment = Math.min(2, Math.floor((targetAccuracy - avgAccuracy) / 15))
  }
  
  // Response time adjustments
  if (avgResponseTime > maxResponseTime) {
    // User is slow - reduce complexity
    matchRateMultiplier *= 0.9
    pacingAdjustment += 1
  }
  
  // Missed response adjustments
  if (missedRate > 0.3) {
    // Too many missed responses - reduce difficulty significantly
    matchRateMultiplier *= 0.8
    complexityBonus -= 0.05
    pacingAdjustment += 1
  }
  
  // Trend-based adjustments
  if (trend > 0.1) {
    // User is improving - gradually increase difficulty
    matchRateMultiplier += trend * 0.2
    complexityBonus += trend * 0.1
  } else if (trend < -0.1) {
    // User is declining - ease off difficulty
    matchRateMultiplier += trend * 0.3
    complexityBonus += trend * 0.15
  }
  
  // Calculate confidence level
  const confidenceLevel = Math.min(1.0, recentPerformance.length / 5) * 
                         (1 - Math.abs(avgAccuracy - targetAccuracy) / 100)
  
  return {
    matchRateMultiplier: Math.max(0.5, Math.min(1.5, matchRateMultiplier)),
    complexityBonus: Math.max(-0.1, Math.min(0.2, complexityBonus)),
    pacingAdjustment: Math.max(-1, Math.min(2, Math.round(pacingAdjustment))),
    confidenceLevel: Math.max(0, Math.min(1, confidenceLevel))
  }
}

/**
 * Applies adaptive adjustments to base difficulty settings
 */
const applyAdaptiveSettings = (
  baseSettings: { position: number, audio: number, maxConsecutive: number, minGap: number, overlapBonus: number },
  adjustments: AdaptiveAdjustments
): { position: number, audio: number, maxConsecutive: number, minGap: number, overlapBonus: number } => {
  return {
    position: Math.max(0.15, Math.min(0.45, baseSettings.position * adjustments.matchRateMultiplier)),
    audio: Math.max(0.15, Math.min(0.45, baseSettings.audio * adjustments.matchRateMultiplier)),
    maxConsecutive: baseSettings.maxConsecutive,
    minGap: Math.max(1, baseSettings.minGap + adjustments.pacingAdjustment),
    overlapBonus: Math.max(-0.05, Math.min(0.25, baseSettings.overlapBonus + adjustments.complexityBonus))
  }
}

/**
 * Creates a performance snapshot from current game state
 */
export const createPerformanceSnapshot = (
  responses: any[],
  timeWindow: number = 10
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
  
  const correctResponses = recentResponses.filter(r => 
    (r.position !== null && r.positionCorrect) || 
    (r.audio !== null && r.audioCorrect) ||
    (r.position === null && r.audio === null && !r.positionExpected && !r.audioExpected)
  ).length
  
  const missedResponses = recentResponses.filter(r => 
    (r.positionExpected && r.position === null) || 
    (r.audioExpected && r.audio === null)
  ).length
  
  const totalPossibleResponses = recentResponses.length
  const accuracy = totalPossibleResponses > 0 ? (correctResponses / totalPossibleResponses) * 100 : 0
  
  const responseTimes = recentResponses
    .filter(r => r.responseTime && r.responseTime > 0)
    .map(r => r.responseTime)
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0
  
  return {
    accuracy,
    responseTime: avgResponseTime,
    missedResponses,
    totalResponses: totalPossibleResponses,
    timestamp: Date.now(),
    difficulty: 1 // This should be calculated based on current game settings
  }
}

/**
 * Calculates the allowed overlap threshold based on n-level and difficulty considerations
 * Higher n-levels allow more overlaps to increase cognitive load
 * 
 * Overlap Strategy:
 * - N-level 1-2: 20-30% overlap (beginner friendly)
 * - N-level 3-4: 30-50% overlap (intermediate challenge)
 * - N-level 5+: 40-60% overlap (advanced difficulty spike)
 * 
 * Research suggests that occasional simultaneous matches:
 * 1. Increase working memory load effectively
 * 2. Provide realistic dual-task training scenarios
 * 3. Create natural difficulty progression
 */
const getOverlapThreshold = (nLevel: number): number => {
  // Base overlap allowance increases with n-level
  const baseThreshold = Math.min(0.2 + (nLevel - 1) * 0.1, 0.6) // 20% to 60% max
  
  // Add small random factor to prevent predictability (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2
  
  return Math.min(baseThreshold * randomFactor, 0.7) // Cap at 70%
}

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
    
    // Smart overlap handling based on difficulty and randomness
    const overlapCount = [...positionMatchIndices].filter(i => audioMatchIndices.has(i)).length
    const maxAllowedOverlap = Math.ceil(Math.min(targetPositionMatches, targetAudioMatches) * getOverlapThreshold(nLevel))
    
    if (overlapCount > maxAllowedOverlap) {
      // Redistribute only excess overlapping indices, keeping some for difficulty
      const availableIndices = shuffledIndices.slice(targetPositionMatches + targetAudioMatches)
      const excessOverlap = overlapCount - maxAllowedOverlap
      let redistributed = 0
      
      for (const index of [...audioMatchIndices]) {
        if (positionMatchIndices.has(index) && redistributed < Math.min(excessOverlap, availableIndices.length)) {
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
 * Generates an adaptive sequence that adjusts difficulty based on real-time performance
 * This creates dynamic training that responds to user performance patterns
 * 
 * ADAPTIVE DIFFICULTY FEATURES:
 * 
 * 1. **Performance Analysis**:
 *    - Tracks accuracy, response time, missed responses
 *    - Identifies performance trends (improving/declining)
 *    - Calculates confidence levels in adjustments
 * 
 * 2. **Dynamic Adjustments**:
 *    - Match Rate: 0.6x to 1.5x based on accuracy
 *    - Overlap Complexity: -0.1 to +0.2 based on performance
 *    - Pacing: Adjusts gaps between matches (-1 to +2)
 * 
 * 3. **Segmented Adaptation**:
 *    - Recalculates difficulty every ~25% of sequence
 *    - Uses recent performance for mid-game adjustments
 *    - Maintains smooth transitions between segments
 * 
 * 4. **Real-time Triggers**:
 *    - Excellent performance (>85% accuracy) → increase difficulty
 *    - Poor performance (<65% accuracy) → decrease difficulty
 *    - High missed responses (>30%) → reduce complexity
 *    - Declining trends → immediate intervention
 * 
 * 5. **N-Level Sensitivity**:
 *    - Higher n-levels have lower accuracy targets
 *    - Adaptive thresholds scale with cognitive load
 *    - More forgiving adjustments for advanced levels
 */
export const generateAdaptiveSequence = (
  length: number,
  gridSize: number,
  nLevel: number = 2,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  performanceHistory: PerformanceSnapshot[] = []
): GameSequence[] => {
  const sequence: GameSequence[] = []
  const maxPosition = gridSize * gridSize - 1
  const maxAudio = 7
  
  // Base difficulty settings
  const baseDifficultySettings = {
    easy: { position: 0.35, audio: 0.35, maxConsecutive: 1, minGap: 2, overlapBonus: 0.05 },
    medium: { position: 0.30, audio: 0.30, maxConsecutive: 2, minGap: 1, overlapBonus: 0.10 },
    hard: { position: 0.25, audio: 0.25, maxConsecutive: 3, minGap: 1, overlapBonus: 0.15 }
  }
  
  // Calculate adaptive adjustments
  const adaptiveAdjustments = calculateAdaptiveAdjustments(performanceHistory, nLevel)
  const settings = applyAdaptiveSettings(baseDifficultySettings[difficulty], adaptiveAdjustments)
  
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
  
  // Generate adaptive sequence segments
  const segmentSize = Math.max(5, Math.floor(eligibleStimuli / 4)) // Adapt every ~25% of sequence
  
  for (let segmentStart = 0; segmentStart < eligibleStimuli; segmentStart += segmentSize) {
    const segmentEnd = Math.min(segmentStart + segmentSize, eligibleStimuli)
    const segmentLength = segmentEnd - segmentStart
    
    // Recalculate adaptive settings for this segment if we have recent performance data
    const recentPerformance = performanceHistory.slice(-3) // Last 3 data points
    const segmentAdjustments = recentPerformance.length > 0 
      ? calculateAdaptiveAdjustments(recentPerformance, nLevel)
      : adaptiveAdjustments
    const segmentSettings = applyAdaptiveSettings(settings, segmentAdjustments)
    
    // Calculate matches for this segment
    const segmentPositionMatches = Math.round(segmentLength * segmentSettings.position)
    const segmentAudioMatches = Math.round(segmentLength * segmentSettings.audio)
    
    // Generate pattern for this segment
    const segmentPattern = createEngagementPattern(
      segmentLength,
      segmentPositionMatches,
      segmentAudioMatches,
      segmentSettings.maxConsecutive,
      segmentSettings.minGap,
      nLevel
    )
    
    // Add pattern-breaking for this segment
    const finalSegmentPattern = addPatternBreaking(
      segmentPattern.position,
      segmentPattern.audio,
      { position: segmentPositionMatches, audio: segmentAudioMatches },
      nLevel
    )
    
    // Generate stimuli for this segment
    for (let i = 0; i < segmentLength; i++) {
      const absoluteIndex = nLevel + segmentStart + i
      const shouldPositionMatch = finalSegmentPattern.position[i]
      const shouldAudioMatch = finalSegmentPattern.audio[i]
      
      let position: number
      let audio: number
      
      if (shouldPositionMatch) {
        position = sequence[absoluteIndex - nLevel].position
      } else {
        const usedPositions = sequence.slice(Math.max(0, absoluteIndex - nLevel * 2), absoluteIndex).map(s => s.position)
        do {
          position = Math.floor(Math.random() * (maxPosition + 1))
        } while (position === sequence[absoluteIndex - nLevel].position || 
                 (usedPositions.filter(p => p === position).length > 1))
      }
      
      if (shouldAudioMatch) {
        audio = sequence[absoluteIndex - nLevel].audio
      } else {
        const usedAudios = sequence.slice(Math.max(0, absoluteIndex - nLevel * 2), absoluteIndex).map(s => s.audio)
        do {
          audio = Math.floor(Math.random() * (maxAudio + 1))
        } while (audio === sequence[absoluteIndex - nLevel].audio || 
                 (usedAudios.filter(a => a === audio).length > 1))
      }
      
      sequence.push({
        position,
        audio,
        timestamp: Date.now() + absoluteIndex * 3000,
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
  
  // Difficulty-based match rates and overlap settings for optimal engagement
  const difficultySettings = {
    easy: { position: 0.35, audio: 0.35, maxConsecutive: 1, minGap: 2, overlapBonus: 0.05 },
    medium: { position: 0.30, audio: 0.30, maxConsecutive: 2, minGap: 1, overlapBonus: 0.10 },
    hard: { position: 0.25, audio: 0.25, maxConsecutive: 3, minGap: 1, overlapBonus: 0.15 }
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
  
  // Create engagement pattern: varied and unpredictable placement with smart overlap handling
  const matchPattern = createEngagementPattern(
    eligibleStimuli, 
    targetPositionMatches, 
    targetAudioMatches,
    settings.maxConsecutive,
    settings.minGap,
    nLevel
  )
  
  // Add pattern-breaking to prevent predictability while considering n-level
  const finalPattern = addPatternBreaking(
    matchPattern.position,
    matchPattern.audio,
    { position: targetPositionMatches, audio: targetAudioMatches },
    nLevel
  )
  
  // Generate remaining stimuli following the engagement pattern
  for (let i = nLevel; i < length; i++) {
    const patternIndex = i - nLevel
    const shouldPositionMatch = finalPattern.position[patternIndex]
    const shouldAudioMatch = finalPattern.audio[patternIndex]
    
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
 * Calculate bell curve weight for position in sequence
 * Favors middle positions to avoid clustering at start/end
 */
const calculateBellCurveWeight = (position: number, length: number): number => {
  if (length <= 1) return 1
  
  // Normalize position to 0-1 range
  const normalized = position / (length - 1)
  
  // Calculate bell curve using gaussian-like function
  // Peak at 0.5 (middle), tapering toward edges
  const center = 0.5
  const spread = 0.3 // Controls width of the bell curve
  const exponent = -Math.pow(normalized - center, 2) / (2 * Math.pow(spread, 2))
  
  // Scale to reasonable range (0.2 to 1.0)
  return 0.2 + 0.8 * Math.exp(exponent)
}

/**
 * Checks if a position is valid for placing a match
 */
const isValidPosition = (
  pattern: boolean[],
  position: number,
  lastPlaced: number,
  minGap: number,
  maxConsecutive: number,
  existingPattern?: boolean[],
  avoidOverlap = false
): boolean => {
  // Check gap constraint
  if (position - lastPlaced <= minGap) return false
  
  // Check overlap constraint
  if (avoidOverlap && existingPattern?.[position]) return false
  
  // Check consecutive constraint
  let consecutive = 0
  for (let i = position - 1; i >= 0 && pattern[i]; i--) consecutive++
  
  return consecutive < maxConsecutive
}

/**
 * Places matches in a pattern array with constraints and bell curve bias
 */
const placeMatches = (
  length: number,
  targetMatches: number,
  maxConsecutive: number,
  minGap: number,
  useBellCurve = true,
  avoidOverlap = false,
  existingPattern?: boolean[]
): boolean[] => {
  const pattern = new Array(length).fill(false)
  let placed = 0
  let lastPlaced = -minGap - 1
  
  // Create weighted slot pool
  const slots = Array.from({ length }, (_, i) => ({
    index: i,
    weight: useBellCurve ? calculateBellCurveWeight(i, length) : 1
  }))
  
  // Shuffle slots for randomness
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]]
  }

  // Place matches using weighted probabilities
  for (const slot of slots) {
    if (placed >= targetMatches) break
    
    if (!isValidPosition(pattern, slot.index, lastPlaced, minGap, maxConsecutive, existingPattern, avoidOverlap)) {
      continue
    }
    
    // Apply bell curve weighting if enabled
    const placementProbability = useBellCurve 
      ? slot.weight * (1.2 - placed / targetMatches)
      : 1.0
    
    if (Math.random() < placementProbability) {
      pattern[slot.index] = true
      placed++
      lastPlaced = slot.index
    }
  }

  // Fill remaining matches with best available positions
  while (placed < targetMatches) {
    const remainingSlots = slots.filter(slotData => {
      const slot = slotData.index
      return !pattern[slot] && 
        isValidPosition(pattern, slot, lastPlaced, minGap, maxConsecutive, existingPattern, avoidOverlap)
    })
    
    if (remainingSlots.length === 0) break
    
    // Choose highest weighted remaining slot
    const bestSlot = remainingSlots.reduce((best, current) => 
      current.weight > best.weight ? current : best
    )
    
    pattern[bestSlot.index] = true
    placed++
    lastPlaced = bestSlot.index
  }

  return pattern
}

/**
 * Creates an engaging pattern with simplified logic
 * Uses bell curve weighted placement to favor middle positions
 */
const createEngagementPattern = (
  length: number,
  positionMatches: number,
  audioMatches: number,
  maxConsecutive: number,
  minGap: number,
  nLevel: number = 2
): { position: boolean[], audio: boolean[] } => {
  // Generate position matches with bell curve bias
  const position = placeMatches(
    length,
    positionMatches,
    maxConsecutive,
    minGap,
    true // useBellCurve
  )

  // Generate audio matches with some overlap avoidance for lower n-levels
  const shouldAvoidOverlap = nLevel < 3
  const audio = placeMatches(
    length,
    audioMatches,
    maxConsecutive,
    minGap,
    true, // useBellCurve
    shouldAvoidOverlap,
    position
  )

  return { position, audio }
}

/**
 * Adds pattern-breaking randomization to prevent predictable sequences
 * Considers overlap benefits for higher n-levels while maintaining engagement
 */
const addPatternBreaking = (
  position: boolean[], 
  audio: boolean[], 
  targetMatches: { position: number, audio: number },
  nLevel: number = 2
): { position: boolean[], audio: boolean[] } => {
  const length = position.length
  
  // Calculate current overlap for decision making
  const currentOverlap = position.filter((pos, i) => pos && audio[i]).length
  const targetOverlap = Math.round(Math.min(targetMatches.position, targetMatches.audio) * getOverlapThreshold(nLevel))
  
  // Detect overly regular patterns and break them (but preserve beneficial overlaps for higher n-levels)
  for (let i = 2; i < length - 2; i++) {
    // Check for alternating patterns
    if (position[i-2] && !position[i-1] && position[i] && !position[i+1] && position[i+2]) {
      // For higher n-levels, be more selective about breaking patterns with overlaps
      const hasOverlap = audio[i]
      if (!hasOverlap || nLevel < 3 || Math.random() < 0.6) {
        position[i] = false
      }
    }
    
    if (audio[i-2] && !audio[i-1] && audio[i] && !audio[i+1] && audio[i+2]) {
      const hasOverlap = position[i]
      if (!hasOverlap || nLevel < 3 || Math.random() < 0.6) {
        audio[i] = false
      }
    }
    
    // Check for too-regular spacing (every 3rd position) - be more lenient with overlaps
    if (i % 3 === 0 && position[i] && position[i-3] && (i+3 < length && position[i+3])) {
      const hasOverlap = audio[i]
      // Keep overlaps for higher n-levels to maintain difficulty
      if (!hasOverlap || nLevel < 4) {
        if (Math.random() < 0.5) {
          position[i] = false
          // Try to place it nearby without creating new overlap conflicts
          for (let j of [i-1, i+1, i-2, i+2]) {
            if (j >= 0 && j < length && !position[j]) {
              // Only place if it doesn't create unwanted patterns
              const wouldCreateOverlap = audio[j]
              if (!wouldCreateOverlap || currentOverlap < targetOverlap) {
                position[j] = true
                break
              }
            }
          }
        }
      }
    }
  }
  
  // Ensure we still have the right number of matches after pattern breaking
  // But be smarter about preserving beneficial overlaps for higher n-levels
  const actualPositionMatches = position.filter(Boolean).length
  const actualAudioMatches = audio.filter(Boolean).length
  const actualOverlap = position.filter((pos, i) => pos && audio[i]).length
  
  // Add back matches if we removed too many, considering overlap strategy
  if (actualPositionMatches < targetMatches.position) {
    const deficit = targetMatches.position - actualPositionMatches
    const availableSlots = position.map((val, idx) => (!val) ? idx : -1)
      .filter(idx => idx !== -1)
    
    for (let i = 0; i < Math.min(deficit, availableSlots.length); i++) {
      // Prefer slots that create beneficial overlaps for higher n-levels
      let bestSlot = availableSlots[0]
      if (nLevel >= 3 && actualOverlap < targetOverlap) {
        const overlapSlot = availableSlots.find(slot => audio[slot])
        if (overlapSlot !== undefined) {
          bestSlot = overlapSlot
        }
      }
      
      const randomSlot = Math.random() < 0.7 ? bestSlot : availableSlots[Math.floor(Math.random() * availableSlots.length)]
      position[randomSlot] = true
      availableSlots.splice(availableSlots.indexOf(randomSlot), 1)
    }
  }
  
  if (actualAudioMatches < targetMatches.audio) {
    const deficit = targetMatches.audio - actualAudioMatches
    const availableSlots = audio.map((val, idx) => (!val) ? idx : -1)
      .filter(idx => idx !== -1)
    
    for (let i = 0; i < Math.min(deficit, availableSlots.length); i++) {
      // Prefer slots that create beneficial overlaps for higher n-levels
      let bestSlot = availableSlots[0]
      if (nLevel >= 3 && actualOverlap < targetOverlap) {
        const overlapSlot = availableSlots.find(slot => position[slot])
        if (overlapSlot !== undefined) {
          bestSlot = overlapSlot
        }
      }
      
      const randomSlot = Math.random() < 0.7 ? bestSlot : availableSlots[Math.floor(Math.random() * availableSlots.length)]
      audio[randomSlot] = true
      availableSlots.splice(availableSlots.indexOf(randomSlot), 1)
    }
  }
  
  return { position, audio }
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
  
  // Check for excellent performance (increase difficulty)
  if (avgAccuracy >= excellentThreshold && avgMissedRate < 0.1) {
    return {
      shouldAdjust: true,
      urgency: recent.every(p => p.accuracy >= excellentThreshold) ? 'high' : 'medium',
      reason: `Excellent performance (${avgAccuracy.toFixed(1)}% accuracy)`,
      recommendedAction: 'increase'
    }
  }
  
  // Check for poor performance (decrease difficulty)
  if (avgAccuracy <= poorThreshold || avgMissedRate > 0.4) {
    return {
      shouldAdjust: true,
      urgency: avgAccuracy <= poorThreshold - 10 ? 'high' : 'medium',
      reason: `Poor performance (${avgAccuracy.toFixed(1)}% accuracy, ${(avgMissedRate * 100).toFixed(1)}% missed)`,
      recommendedAction: 'decrease'
    }
  }
  
  // Check for declining trend
  if (recent.length >= 3) {
    const trend = recent[recent.length - 1].accuracy - recent[0].accuracy
    if (trend < -15) {
      return {
        shouldAdjust: true,
        urgency: 'medium',
        reason: `Declining performance trend (${trend.toFixed(1)}% drop)`,
        recommendedAction: 'decrease'
      }
    }
  }
  
  return {
    shouldAdjust: false,
    urgency: 'low',
    reason: 'Performance within acceptable range',
    recommendedAction: 'maintain'
  }
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
 * // During game, periodically create snapshots
 * if (responses.length % 5 === 0) {
 *   const snapshot = createPerformanceSnapshot(responses, 10)
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

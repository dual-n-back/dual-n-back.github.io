import { GameSequence } from '../types/game'
import { PerformanceSnapshot } from './gameLogic'
import { shuffleArray } from './gameLogic'

/**
 * Configuration for adaptive sequence generation
 */
export interface AdaptiveConfig {
  nLevel: number
  gridSize: number
  difficulty: 'easy' | 'medium' | 'hard'
  segmentSize: number
  targetPositionMatchRate: number
  targetAudioMatchRate: number
  maxConsecutive: number
  minGap: number
  overlapBonus: number
}

/**
 * Current state of the adaptive sequence generator
 */
interface GeneratorState {
  generatedCount: number
  recentPositions: number[]
  recentAudios: number[]
  currentConfig: AdaptiveConfig
  nextSegmentMatches: {
    position: Set<number>
    audio: Set<number>
  }
}

/**
 * Virtual Adaptive Sequence Generator
 * Generates stimuli on-demand and adapts based on real-time performance
 */
export class AdaptiveSequenceGenerator {
  private state: GeneratorState
  private maxPosition: number
  private maxAudio: number
  private baseSequence: GameSequence[] = []

  constructor(config: AdaptiveConfig) {
    this.maxPosition = config.gridSize * config.gridSize - 1
    this.maxAudio = 7 // 8 different audio tones (0-7)
    
    this.state = {
      generatedCount: 0,
      recentPositions: [],
      recentAudios: [],
      currentConfig: { ...config },
      nextSegmentMatches: {
        position: new Set(),
        audio: new Set()
      }
    }

    // Generate initial n-level stimuli (no matches possible)
    this.generateInitialStimuli()
    this.planNextSegment()
  }

  /**
   * Generate the first n stimuli where no matches are possible
   */
  private generateInitialStimuli(): void {
    const { nLevel } = this.state.currentConfig
    
    for (let i = 0; i < nLevel; i++) {
      const stimulus: GameSequence = {
        position: Math.floor(Math.random() * (this.maxPosition + 1)),
        audio: Math.floor(Math.random() * (this.maxAudio + 1)),
        timestamp: Date.now() + i * 3000,
      }
      
      this.baseSequence.push(stimulus)
      this.state.recentPositions.push(stimulus.position)
      this.state.recentAudios.push(stimulus.audio)
      this.state.generatedCount++
    }
  }

  /**
   * Plan matches for the next segment based on current config
   */
  private planNextSegment(): void {
    const { segmentSize, targetPositionMatchRate, targetAudioMatchRate } = this.state.currentConfig
    const startIndex = this.state.generatedCount
    
    // Calculate target matches for this segment
    const targetPositionMatches = Math.round(segmentSize * targetPositionMatchRate)
    const targetAudioMatches = Math.round(segmentSize * targetAudioMatchRate)
    
    // Clear previous segment planning
    this.state.nextSegmentMatches.position.clear()
    this.state.nextSegmentMatches.audio.clear()
    
    // Plan position matches
    if (targetPositionMatches > 0) {
      const positionIndices = this.selectMatchIndices(segmentSize, targetPositionMatches)
      positionIndices.forEach(idx => 
        this.state.nextSegmentMatches.position.add(startIndex + idx)
      )
    }
    
    // Plan audio matches (with some overlap control)
    if (targetAudioMatches > 0) {
      const audioIndices = this.selectMatchIndices(segmentSize, targetAudioMatches)
      audioIndices.forEach(idx => 
        this.state.nextSegmentMatches.audio.add(startIndex + idx)
      )
    }

    console.log('🎯 Planned Next Segment:', {
      startIndex,
      segmentSize,
      targetPositionMatches,
      targetAudioMatches,
      positionIndices: Array.from(this.state.nextSegmentMatches.position),
      audioIndices: Array.from(this.state.nextSegmentMatches.audio)
    })
  }

  /**
   * Select indices for matches using weighted distribution
   */
  private selectMatchIndices(segmentSize: number, targetMatches: number): number[] {
    const indices = Array.from({ length: segmentSize }, (_, i) => i)
    const shuffled = shuffleArray(indices)
    return shuffled.slice(0, targetMatches)
  }

  /**
   * Get the next stimulus in the sequence
   */
  getNextStimulus(): GameSequence {
    const currentIndex = this.state.generatedCount
    const { nLevel } = this.state.currentConfig
    
    // Check if we have this stimulus already generated
    if (currentIndex < this.baseSequence.length) {
      return this.baseSequence[currentIndex]
    }

    // Generate new stimulus
    const shouldPositionMatch = this.state.nextSegmentMatches.position.has(currentIndex)
    const shouldAudioMatch = this.state.nextSegmentMatches.audio.has(currentIndex)
    
    let position: number
    let audio: number

    if (shouldPositionMatch && currentIndex >= nLevel) {
      position = this.baseSequence[currentIndex - nLevel].position
    } else {
      // Generate non-matching position
      do {
        position = Math.floor(Math.random() * (this.maxPosition + 1))
      } while (
        currentIndex >= nLevel && 
        position === this.baseSequence[currentIndex - nLevel].position
      )
    }

    if (shouldAudioMatch && currentIndex >= nLevel) {
      audio = this.baseSequence[currentIndex - nLevel].audio
    } else {
      // Generate non-matching audio
      do {
        audio = Math.floor(Math.random() * (this.maxAudio + 1))
      } while (
        currentIndex >= nLevel && 
        audio === this.baseSequence[currentIndex - nLevel].audio
      )
    }

    const stimulus: GameSequence = {
      position,
      audio,
      timestamp: Date.now() + currentIndex * 3000,
    }

    // Store the generated stimulus
    this.baseSequence.push(stimulus)
    this.state.recentPositions.push(position)
    this.state.recentAudios.push(audio)
    this.state.generatedCount++

    console.log('🎮 Generated Stimulus:', {
      index: currentIndex,
      position,
      audio,
      shouldPositionMatch,
      shouldAudioMatch,
      nBackPosition: currentIndex >= nLevel ? this.baseSequence[currentIndex - nLevel].position : null,
      nBackAudio: currentIndex >= nLevel ? this.baseSequence[currentIndex - nLevel].audio : null
    })

    // Check if we need to plan the next segment
    const segmentPosition = (currentIndex - nLevel) % this.state.currentConfig.segmentSize
    if (segmentPosition === this.state.currentConfig.segmentSize - 1) {
      this.planNextSegment()
    }

    return stimulus
  }

  /**
   * Peek at the next stimulus without advancing the generator
   */
  peekNextStimulus(): GameSequence {
    const currentIndex = this.state.generatedCount
    
    if (currentIndex < this.baseSequence.length) {
      return this.baseSequence[currentIndex]
    }

    // For peek, we need to simulate generation without advancing state
    const shouldPositionMatch = this.state.nextSegmentMatches.position.has(currentIndex)
    const shouldAudioMatch = this.state.nextSegmentMatches.audio.has(currentIndex)
    const { nLevel } = this.state.currentConfig
    
    let position: number
    let audio: number

    if (shouldPositionMatch && currentIndex >= nLevel) {
      position = this.baseSequence[currentIndex - nLevel].position
    } else {
      position = Math.floor(Math.random() * (this.maxPosition + 1))
    }

    if (shouldAudioMatch && currentIndex >= nLevel) {
      audio = this.baseSequence[currentIndex - nLevel].audio
    } else {
      audio = Math.floor(Math.random() * (this.maxAudio + 1))
    }

    return {
      position,
      audio,
      timestamp: Date.now() + currentIndex * 3000,
    }
  }

  /**
   * Update the generator configuration based on performance
   */
  updateConfig(performanceSnapshot: PerformanceSnapshot): void {
    const { accuracy, missedResponses, totalResponses } = performanceSnapshot
    const missedRate = totalResponses > 0 ? missedResponses / totalResponses : 0
    
    // Calculate adjustments based on performance
    let matchRateMultiplier = 1.0
    let complexityAdjustment = 0
    
    // Performance-based adjustments
    if (accuracy > 85 && missedRate < 0.1) {
      // Excellent performance - increase difficulty
      matchRateMultiplier = 1.2
      complexityAdjustment = 0.05
      console.log('🚀 Adaptive: Increasing difficulty - excellent performance')
    } else if (accuracy < 60 || missedRate > 0.3) {
      // Poor performance - decrease difficulty
      matchRateMultiplier = 0.8
      complexityAdjustment = -0.05
      console.log('📉 Adaptive: Decreasing difficulty - poor performance')
    } else {
      console.log('✅ Adaptive: Maintaining difficulty - balanced performance')
    }
    
    // Update configuration
    const newConfig = { ...this.state.currentConfig }
    newConfig.targetPositionMatchRate = Math.max(0.15, Math.min(0.45, 
      newConfig.targetPositionMatchRate * matchRateMultiplier
    ))
    newConfig.targetAudioMatchRate = Math.max(0.15, Math.min(0.45, 
      newConfig.targetAudioMatchRate * matchRateMultiplier
    ))
    newConfig.overlapBonus = Math.max(0, Math.min(0.2, 
      newConfig.overlapBonus + complexityAdjustment
    ))
    
    this.state.currentConfig = newConfig
    
    // Replan the current segment with new parameters
    this.planNextSegment()
    
    console.log('🧠 Config Updated:', {
      accuracy: accuracy.toFixed(1) + '%',
      missedRate: (missedRate * 100).toFixed(1) + '%',
      matchRateMultiplier,
      newPositionRate: newConfig.targetPositionMatchRate.toFixed(3),
      newAudioRate: newConfig.targetAudioMatchRate.toFixed(3),
      overlapBonus: newConfig.overlapBonus.toFixed(3)
    })
  }

  /**
   * Get the current generation statistics
   */
  getStats(): {
    generatedCount: number
    currentConfig: AdaptiveConfig
    plannedMatches: {
      positionCount: number
      audioCount: number
      overlapCount: number
    }
  } {
    const positionMatches = Array.from(this.state.nextSegmentMatches.position)
    const audioMatches = Array.from(this.state.nextSegmentMatches.audio)
    const overlap = positionMatches.filter(idx => this.state.nextSegmentMatches.audio.has(idx))
    
    return {
      generatedCount: this.state.generatedCount,
      currentConfig: { ...this.state.currentConfig },
      plannedMatches: {
        positionCount: positionMatches.length,
        audioCount: audioMatches.length,
        overlapCount: overlap.length
      }
    }
  }

  /**
   * Get all generated stimuli so far (for compatibility)
   */
  getGeneratedSequence(): GameSequence[] {
    return [...this.baseSequence]
  }

  /**
   * Reset the generator to initial state
   */
  reset(config: AdaptiveConfig): void {
    this.state = {
      generatedCount: 0,
      recentPositions: [],
      recentAudios: [],
      currentConfig: { ...config },
      nextSegmentMatches: {
        position: new Set(),
        audio: new Set()
      }
    }
    this.baseSequence = []
    this.generateInitialStimuli()
    this.planNextSegment()
  }
}

/**
 * Create an adaptive sequence generator with default configuration
 */
export function createAdaptiveGenerator(
  nLevel: number = 2,
  gridSize: number = 3,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): AdaptiveSequenceGenerator {
  // Difficulty-based settings
  const difficultySettings = {
    easy: { targetPositionMatchRate: 0.35, targetAudioMatchRate: 0.35, maxConsecutive: 1, minGap: 2, overlapBonus: 0.05 },
    medium: { targetPositionMatchRate: 0.30, targetAudioMatchRate: 0.30, maxConsecutive: 2, minGap: 1, overlapBonus: 0.10 },
    hard: { targetPositionMatchRate: 0.25, targetAudioMatchRate: 0.25, maxConsecutive: 3, minGap: 1, overlapBonus: 0.15 }
  }
  
  const settings = difficultySettings[difficulty]
  
  const config: AdaptiveConfig = {
    nLevel,
    gridSize,
    difficulty,
    segmentSize: 5, // Generate 5 stimuli at a time
    ...settings
  }
  
  return new AdaptiveSequenceGenerator(config)
}

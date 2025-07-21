import { generateGameSequence, generateEngagingSequence, calculateEngagementMetrics, analyzeMatchDistribution } from './gameLogic'

/**
 * Test function to compare old vs new sequence generation
 * This helps demonstrate the improvement in user engagement
 */
export const compareSequenceEngagement = (
  length: number = 20,
  gridSize: number = 3,
  nLevel: number = 2,
  iterations: number = 10
) => {
  console.log(`🧠 Dual N-Back Engagement Analysis`)
  console.log(`📊 Comparing Random vs Engaging sequence generation`)
  console.log(`🎯 Test parameters: ${length} stimuli, ${gridSize}x${gridSize} grid, ${nLevel}-back`)
  console.log(`🔄 Running ${iterations} iterations for statistical significance\n`)

  let oldResults = {
    avgPositionMatches: 0,
    avgAudioMatches: 0,
    avgIdlePeriods: 0,
    avgMaxIdle: 0,
    avgDistributionScore: 0
  }

  let newResults = {
    avgPositionMatches: 0,
    avgAudioMatches: 0,
    avgIdlePeriods: 0,
    avgMaxIdle: 0,
    avgDistributionScore: 0
  }

  // Test old random generation
  for (let i = 0; i < iterations; i++) {
    const sequence = generateGameSequence(length + nLevel, gridSize, nLevel)
    const mockResponses = Array.from({ length }, () => ({ position: null, audio: null }))
    const metrics = calculateEngagementMetrics(sequence, mockResponses, nLevel)
    const distribution = analyzeMatchDistribution(sequence, nLevel)

    oldResults.avgPositionMatches += metrics.actualPositionMatchRate
    oldResults.avgAudioMatches += metrics.actualAudioMatchRate
    oldResults.avgIdlePeriods += metrics.idlePeriods
    oldResults.avgMaxIdle += metrics.maxIdlePeriod
    oldResults.avgDistributionScore += distribution.distributionScore
  }

  // Test new engaging generation
  for (let i = 0; i < iterations; i++) {
    const sequence = generateEngagingSequence(length + nLevel, gridSize, nLevel, 'medium')
    const mockResponses = Array.from({ length }, () => ({ position: null, audio: null }))
    const metrics = calculateEngagementMetrics(sequence, mockResponses, nLevel)
    const distribution = analyzeMatchDistribution(sequence, nLevel)

    newResults.avgPositionMatches += metrics.actualPositionMatchRate
    newResults.avgAudioMatches += metrics.actualAudioMatchRate
    newResults.avgIdlePeriods += metrics.idlePeriods
    newResults.avgMaxIdle += metrics.maxIdlePeriod
    newResults.avgDistributionScore += distribution.distributionScore
  }

  // Calculate averages
  Object.keys(oldResults).forEach(key => {
    oldResults[key as keyof typeof oldResults] /= iterations
    newResults[key as keyof typeof newResults] /= iterations
  })

  // Display results
  console.log('📈 RESULTS COMPARISON:')
  console.log('─'.repeat(60))
  console.log(`                      Random    Engaging   Improvement`)
  console.log('─'.repeat(60))
  console.log(`Position Match Rate:  ${(oldResults.avgPositionMatches * 100).toFixed(1)}%      ${(newResults.avgPositionMatches * 100).toFixed(1)}%      ${((newResults.avgPositionMatches - oldResults.avgPositionMatches) * 100).toFixed(1)}%`)
  console.log(`Audio Match Rate:     ${(oldResults.avgAudioMatches * 100).toFixed(1)}%      ${(newResults.avgAudioMatches * 100).toFixed(1)}%      ${((newResults.avgAudioMatches - oldResults.avgAudioMatches) * 100).toFixed(1)}%`)
  console.log(`Idle Periods:         ${oldResults.avgIdlePeriods.toFixed(1)}       ${newResults.avgIdlePeriods.toFixed(1)}       ${(oldResults.avgIdlePeriods - newResults.avgIdlePeriods).toFixed(1)}`)
  console.log(`Max Idle Period:      ${oldResults.avgMaxIdle.toFixed(1)}       ${newResults.avgMaxIdle.toFixed(1)}       ${(oldResults.avgMaxIdle - newResults.avgMaxIdle).toFixed(1)}`)
  console.log(`Distribution Score:   ${oldResults.avgDistributionScore.toFixed(1)}      ${newResults.avgDistributionScore.toFixed(1)}      +${(newResults.avgDistributionScore - oldResults.avgDistributionScore).toFixed(1)}`)
  console.log('─'.repeat(60))

  const overallImprovement = (
    (newResults.avgPositionMatches > 0.25 && newResults.avgPositionMatches < 0.35 ? 20 : 0) +
    (newResults.avgAudioMatches > 0.25 && newResults.avgAudioMatches < 0.35 ? 20 : 0) +
    (newResults.avgIdlePeriods < oldResults.avgIdlePeriods ? 20 : 0) +
    (newResults.avgMaxIdle < oldResults.avgMaxIdle ? 20 : 0) +
    (newResults.avgDistributionScore > oldResults.avgDistributionScore ? 20 : 0)
  )

  console.log(`\n🎯 Overall Engagement Improvement: ${overallImprovement}%`)
  
  if (overallImprovement >= 80) {
    console.log('🌟 EXCELLENT: Highly engaging sequences with optimal match distribution!')
  } else if (overallImprovement >= 60) {
    console.log('✅ GOOD: Significant improvement in user engagement!')
  } else if (overallImprovement >= 40) {
    console.log('📈 MODERATE: Some improvement, but could be optimized further.')
  } else {
    console.log('⚠️  NEEDS WORK: Engagement improvements are minimal.')
  }

  console.log('\n💡 Key Benefits of Engaging Sequences:')
  console.log('• More consistent match rates (target: 25-35%)')
  console.log('• Fewer long idle periods (reduces boredom)')
  console.log('• Better distribution prevents match clustering')
  console.log('• Alternating patterns maintain active participation')
  console.log('• Adaptive difficulty based on n-level')
}

/**
 * Demonstrates a single sequence comparison with detailed analysis
 */
export const demonstrateSequenceImprovement = (nLevel: number = 2) => {
  const length = 20
  const gridSize = 3

  console.log(`\n🔍 DETAILED SEQUENCE ANALYSIS (${nLevel}-back)`)
  console.log('=' .repeat(50))

  // Generate both types
  const randomSequence = generateGameSequence(length + nLevel, gridSize, nLevel)
  const engagingSequence = generateEngagingSequence(length + nLevel, gridSize, nLevel, 'medium')

  // Analyze patterns
  const mockResponses = Array.from({ length }, () => ({ position: null, audio: null }))
  
  const randomMetrics = calculateEngagementMetrics(randomSequence, mockResponses, nLevel)
  const engagingMetrics = calculateEngagementMetrics(engagingSequence, mockResponses, nLevel)

  const randomDistribution = analyzeMatchDistribution(randomSequence, nLevel)
  const engagingDistribution = analyzeMatchDistribution(engagingSequence, nLevel)

  console.log('\n📊 MATCH FREQUENCY ANALYSIS:')
  console.log(`Random   - Position: ${(randomMetrics.actualPositionMatchRate * 100).toFixed(1)}%, Audio: ${(randomMetrics.actualAudioMatchRate * 100).toFixed(1)}%`)
  console.log(`Engaging - Position: ${(engagingMetrics.actualPositionMatchRate * 100).toFixed(1)}%, Audio: ${(engagingMetrics.actualAudioMatchRate * 100).toFixed(1)}%`)
  console.log(`Target Range: 25-35% for optimal engagement`)

  console.log('\n⏱️  IDLE PERIOD ANALYSIS:')
  console.log(`Random   - Idle Periods: ${randomMetrics.idlePeriods}, Max Consecutive: ${randomMetrics.maxIdlePeriod}`)
  console.log(`Engaging - Idle Periods: ${engagingMetrics.idlePeriods}, Max Consecutive: ${engagingMetrics.maxIdlePeriod}`)
  console.log(`Goal: Minimize long periods without user interaction`)

  console.log('\n📏 DISTRIBUTION QUALITY:')
  console.log(`Random   - Distribution Score: ${randomDistribution.distributionScore.toFixed(1)}/100`)
  console.log(`Engaging - Distribution Score: ${engagingDistribution.distributionScore.toFixed(1)}/100`)
  console.log(`Higher scores indicate better spacing between matches`)

  return {
    random: { metrics: randomMetrics, distribution: randomDistribution },
    engaging: { metrics: engagingMetrics, distribution: engagingDistribution }
  }
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testEngagement = {
    compare: compareSequenceEngagement,
    demonstrate: demonstrateSequenceImprovement
  }
}

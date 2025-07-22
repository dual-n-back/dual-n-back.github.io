import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Paper,
  Grid,
  Typography,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Button,
} from '@mui/material'
import {
  TrendingUp as LevelUpIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import { useGameStore } from '../../stores/gameStore'
import { playAudioTone, prewarmSpeechSynthesis } from '../../utils/audioManager'
import { indexToRowCol, calculateAccuracy } from '../../utils/gameLogic'

const GameBoard: React.FC = () => {
  const { 
    isPlaying,
    currentRound,
    nLevel,
    gamePhase,
    settings,
    score,
    currentStimulusIndex,
    updateSettings,
    resetGame,
  } = useGameStore()
  
  const theme = useTheme()
  const [activePosition, setActivePosition] = useState<number | null>(null)
  const [preparationTime, setPreparationTime] = useState<number | null>(null)

  // Effect to handle game preparation countdown
  useEffect(() => {
    // Only start countdown if we're playing and in preparation phase without existing countdown
    if (isPlaying && gamePhase === 'preparation' && preparationTime === null) {
      setPreparationTime(3) // Start with 3 seconds (3, 2, 1, GO!)
      
      // Prewarm speech synthesis during countdown to prevent first letter cutoff
      prewarmSpeechSynthesis().catch(console.warn)
      
      const countdown = setInterval(() => {
        setPreparationTime(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdown)
            // After countdown finishes, transition to first stimulus
            setTimeout(() => {
              setPreparationTime(null)
              const gameStore = useGameStore.getState()
              gameStore.presentStimulus(0)
            }, 500) // Brief delay after "GO!" message
            return null
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        clearInterval(countdown)
      }
    } else if (!isPlaying || (gamePhase !== 'preparation' && preparationTime !== null)) {
      setPreparationTime(null)
    }
  }, [isPlaying, gamePhase])

  // Effect to handle stimulus presentation
  useEffect(() => {
    const currentStimulus = useGameStore.getState().currentStimulus()
    
    if (!currentStimulus || gamePhase !== 'stimulus' || preparationTime !== null) {
      setActivePosition(null)
      return
    }

    // Show visual stimulus
    if (settings.showVisual) {
      setActivePosition(currentStimulus.position)
    }

    // Play audio stimulus
    if (settings.showAudio) {
      playAudioTone(
        currentStimulus.audio,
        settings.audioType,
        settings.stimulusDuration,
        settings.volume
      )
    }

    // Clear visual stimulus after duration
    const timer = setTimeout(() => {
      setActivePosition(null)
    }, settings.stimulusDuration)

    return () => clearTimeout(timer)
  }, [currentStimulusIndex, gamePhase, settings, preparationTime])

  const renderGridCell = useCallback((index: number) => {
    const { row, col } = indexToRowCol(index, settings.gridSize)
    const isActive = activePosition === index
    
    return (
      <Grid item xs={12 / settings.gridSize} key={`${row}-${col}`}>
        <Zoom in={true} timeout={200} style={{ transitionDelay: `${index * 20}ms` }}>
          <Paper
            elevation={isActive ? 8 : 2}
            sx={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`
                : alpha(theme.palette.background.paper, 0.8),
              border: `2px solid ${isActive ? alpha(theme.palette.primary.main, 0.8) : alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isActive
                ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            }}
          >
            <Box
              sx={{
                width: '60%',
                height: '60%',
                borderRadius: '50%',
                background: isActive
                  ? 'rgba(255, 255, 255, 0.9)'
                  : alpha(theme.palette.primary.main, 0.1),
                transition: 'all 0.3s ease',
              }}
            />
          </Paper>
        </Zoom>
      </Grid>
    )
  }, [activePosition, settings.gridSize, theme])

  // Show results when game is completed
  if (gamePhase === 'completed') {
    const accuracy = calculateAccuracy(score.totalCorrect, score.totalIncorrect, score.totalMissed, settings.totalRounds)
    const isExcellentPerformance = accuracy >= 90
    const canLevelUp = isExcellentPerformance && nLevel < 10
    
    const handleContinueNextLevel = () => {
      // Clear any existing preparation state
      setPreparationTime(null)
      
      // Update level and reset game in sequence
      updateSettings({ nLevel: nLevel + 1 })
      resetGame()
      
      // Start the game after a brief delay to ensure state is clean
      setTimeout(() => {
        const gameStore = useGameStore.getState()
        gameStore.startGame()
      }, 300) // Brief delay to ensure all state updates complete
    }
    
    return (
      <Fade in={true}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundImage: 'url(/generated_head.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 1,
              zIndex: 0,
            },
            '& > *': {
              position: 'relative',
              zIndex: 1,
            }
          }}
        >
          
          <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
            Final Score: {accuracy.toFixed(1)}%
          </Typography>

          {/* Excellent Performance Message */}
          {isExcellentPerformance && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <CelebrationIcon sx={{ color: 'orange' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'orange' }}>
                  Excellent Performance!
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'orange' }}>
                You've mastered the {nLevel}-back level with {accuracy.toFixed(1)}% accuracy!
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            {/* Correct Responses */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.8) }}>
              <Typography variant="h6" gutterBottom>
                ✅ Correct ({score.totalCorrect})
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Position: {score.positionCorrect}
              </Typography>
              <Typography variant="body2">
                Audio: {score.audioCorrect}
              </Typography>
            </Paper>

            {/* Incorrect Responses */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.error.main, 0.8) }}>
              <Typography variant="h6" gutterBottom>
                ❌ Incorrect ({score.totalIncorrect})
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Position: {score.positionIncorrect}
              </Typography>
              <Typography variant="body2">
                Audio: {score.audioIncorrect}
              </Typography>
            </Paper>
          </Box>

   
            <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.warning.main, 0.8) }}>
              <Typography variant="h6" gutterBottom>
                ⏰ Missed Opportunities: {score.totalMissed}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Position matches missed: {score.missedPositional}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Audio matches missed: {score.missedAudio}
              </Typography>
            </Paper>

          {/* Continue to Next Level Button */}
          {canLevelUp && (
            <Fade in={true} timeout={1000}>
              <Button
                onClick={handleContinueNextLevel}
                variant="contained"
                size="large"
                startIcon={<LevelUpIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: 'success.main',
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.5)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Continue to {nLevel + 1}-Back Level
              </Button>
            </Fade>
          )}

          {/* Max Level Reached Message */}
          {isExcellentPerformance && nLevel >= 10 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
              <Typography variant="h6" color="info.main" sx={{ fontWeight: 600, mb: 1 }}>
                🏆 Master Level Achieved!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You've reached the maximum difficulty level. Congratulations on mastering the Dual N-Back challenge!
              </Typography>
            </Box>
          )}
          
        </Paper>
      </Fade>
    )
  }

  if (!isPlaying && currentRound === 0) {
    return (
      <Fade in={true}>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h5" gutterBottom color="text.secondary">
            Ready to Train Your Brain?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            💡 New to the game? Visit the <strong>Tutorial</strong> tab for complete instructions and tips!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Click "Start Game" to begin your Dual N-Back training session.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You'll need to identify when stimuli match those from {nLevel} steps back.
          </Typography>
          
          {/* Advanced Algorithm Features */}
          <Box sx={{ 
            mt: 3, 
            mb: 2, 
            p: 2, 
            backgroundColor: alpha(theme.palette.info.main, 0.05), 
            borderRadius: 1,
            maxWidth: '500px',
            mx: 'auto'
          }}>
            <Typography variant="h6" color="info.main" sx={{ mb: 1, fontSize: '0.9rem', textAlign: 'center' }}>
              🧠 Advanced AI Training Algorithm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4, textAlign: 'left' }}>
              • <strong>Adaptive Difficulty:</strong> Real-time performance analysis adjusts challenge level<br/>
              • <strong>Bell Curve Distribution:</strong> Smart pattern placement prevents edge clustering<br/>
              • <strong>Cognitive Load Optimization:</strong> N-level aware overlap strategies (20-70% scaling)<br/>
              • <strong>Performance Tracking:</strong> Snapshots every 5 responses with trend analysis<br/>
              • <strong>Research-Based:</strong> Helps improve ADHD symptoms and boost brain activity
            </Typography>
          </Box>
        </Paper>
      </Fade>
    )
  }

  return (
    <Fade in={true}>
      <Box sx={{ width: '100%' }}>

        {/* Preparation Countdown */}
        {isPlaying && preparationTime !== null && (
          <Fade in={true}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  animation: 'pulse 1s ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.8 },
                    '50%': { transform: 'scale(1.1)', opacity: 1 },
                    '100%': { transform: 'scale(1)', opacity: 0.8 },
                  },
                }}
              >
                {(preparationTime ?? 0) > 0 ? preparationTime : 'GO!'}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {(preparationTime ?? 0) > 0 ? 'Get Ready...' : 'Game Starting!'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nLevel}-Back Level • Remember {nLevel} steps back
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Game Grid - only show when not in preparation */}
        {isPlaying && preparationTime === null && (
          <Grid 
            container 
            spacing={1.5} 
            sx={{ 
              maxWidth: '300px', 
              margin: '0 auto',
              backgroundImage: 'url(/generated_head.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 2,
              padding: '12px 6px 6px 0px',
              position: 'relative',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 2,
                zIndex: 0,
              },
              '& > .MuiGrid-item': {
                position: 'relative',
                zIndex: 1,
                paddingLeft: '6px !important',
                paddingTop: '6px !important',
              }
            }}
          >
            {Array.from({ length: settings.gridSize ** 2 }, (_, index) => renderGridCell(index))}
          </Grid>
        )}

        {/* Show grid for non-playing states */}
        {!isPlaying && (
          <Grid 
            container 
            spacing={1.5} 
            sx={{ 
              maxWidth: '300px', 
              margin: '0 auto',
              backgroundImage: 'url(/generated_head.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 2,
              padding: '12px 6px 6px 0px',
              position: 'relative',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 2,
                zIndex: 0,
              },
              '& > .MuiGrid-item': {
                position: 'relative',
                zIndex: 1,
                paddingLeft: '6px !important',
                paddingTop: '6px !important',
              }
            }}
          >
            {Array.from({ length: settings.gridSize ** 2 }, (_, index) => renderGridCell(index))}
          </Grid>
        )}

        {/* Game Info */}
 
      </Box>
    </Fade>
  )
}

export default GameBoard

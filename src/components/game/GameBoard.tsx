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
} from '@mui/material'
import { useGameStore } from '../../stores/gameStore'
import { playAudioTone } from '../../utils/audioManager'
import { indexToRowCol } from '../../utils/gameLogic'

const GameBoard: React.FC = () => {
  const { 
    isPlaying,
    currentRound,
    nLevel,
    gamePhase,
    settings,
    score,
    currentStimulusIndex,
  } = useGameStore()
  
  const theme = useTheme()
  const [activePosition, setActivePosition] = useState<number | null>(null)

  // Effect to handle stimulus presentation
  useEffect(() => {
    const currentStimulus = useGameStore.getState().currentStimulus()
    
    if (!currentStimulus || gamePhase !== 'stimulus') {
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
  }, [currentStimulusIndex, gamePhase, settings])

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
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                : theme.palette.background.paper,
              border: `2px solid ${isActive ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
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
    const accuracy = score.totalCorrect + score.totalIncorrect > 0 
      ? (score.totalCorrect / (score.totalCorrect + score.totalIncorrect) * 100) 
      : 0
    
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Click "Start Game" to begin your Dual N-Back training session.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll need to identify when stimuli match those from {nLevel} steps back.
          </Typography>
        </Paper>
      </Fade>
    )
  }

  return (
    <Fade in={true}>
      <Box sx={{ width: '100%' }}>

        {/* Game Grid */}

          <Grid 
            container 
            spacing={2} 
            sx={{ 
              maxWidth: '400px', 
              margin: '0 auto',
              backgroundImage: 'url(/generated_head.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 2,
              padding: 2,
              position: 'relative',
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
              '& > *': {
                position: 'relative',
                zIndex: 1,
              }
            }}
          >
            {Array.from({ length: settings.gridSize ** 2 }, (_, index) => renderGridCell(index))}
          </Grid>


        {/* Game Info */}
 
      </Box>
    </Fade>
  )
}

export default GameBoard

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
  } = useGameStore()
  
  const currentStimulus = useGameStore.getState().currentStimulus()
  const theme = useTheme()
  const [activePosition, setActivePosition] = useState<number | null>(null)

  // Effect to handle stimulus presentation
  useEffect(() => {
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
  }, [currentStimulus, gamePhase, settings])

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

          <Grid container spacing={2} sx={{ maxWidth: '400px', margin: '0 auto' }}>
            {Array.from({ length: settings.gridSize ** 2 }, (_, index) => renderGridCell(index))}
          </Grid>


        {/* Game Info */}
 
      </Box>
    </Fade>
  )
}

export default GameBoard

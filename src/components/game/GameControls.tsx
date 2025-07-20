import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Button,
  ButtonGroup,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  PlayArrow as PlayIcon,

  Refresh as ResetIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  Grid4x4Sharp,
} from '@mui/icons-material'
import { ResponseType } from '../../types/game'
import { useGame } from '../../contexts/GameContext'
import { useStats } from '../../contexts/StatsContext'
import { generateSessionId } from '../../utils/gameLogic'

const GameControls: React.FC = () => {
  const { state, settings, startGame, pauseGame, resumeGame, stopGame, resetGame, updateSettings, submitResponse } = useGame()
  const { addGameSession } = useStats()

  
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [feedbackTimeout, setFeedbackTimeout] = useState<number | null>(null)

  const getButtonColor = (type: ResponseType) => {
    const feedbackState = state.feedback[type];
    if (feedbackState === undefined) return 'darkgrey';
    return feedbackState ? 'green' : 'red';
  }

  const handlePositionMatch = () => submitResponse('position')
  const handleAudioMatch = () => submitResponse('audio')

  // Handle game completion
  useEffect(() => {
    if (state.gamePhase === 'completed' && state.gameEndTime) {
      const session = {
        id: generateSessionId(),
        date: Date.now(),
        nLevel: state.nLevel,
        totalRounds: state.currentRound,
        completedRounds: state.currentRound,
        score: state.score,
        duration: state.gameStartTime ? state.gameEndTime - state.gameStartTime : 0,
        settings,
        responses: state.responses,
        completed: true,
      }
      addGameSession(session)
    }
  }, [state.gamePhase, state.gameEndTime]) // Only depend on the completion trigger

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout)
      }
    }
  }, [feedbackTimeout])

  const canStart = !state.isPlaying

  return (
    <Fade in={true}>
      <Box>
        {/* Main Control Panel */}

          {/* Game Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ButtonGroup size="large" variant="contained" sx={{ borderRadius: 2 }}>
              {canStart && (
                <Button
                  onClick={startGame}
                  startIcon={<PlayIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Start Game
                </Button>
              )}
              
            </ButtonGroup>
            
            {!state.isPlaying && (
              <Tooltip title="Reset game settings">
                <IconButton
                  onClick={resetGame}
                  sx={{ ml: 2, color: 'text.secondary' }}
                >
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Response Section */}
          {state.isPlaying && (
            <Fade in={true}>
              <Box>
                {/* Response Buttons*/}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                  <Button
                    onClick={handlePositionMatch}
                    id="position-btn"
                    sx={{
                      px: 6,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      backgroundColor: getButtonColor('position'),
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: getButtonColor('position') === 'darkgrey' ? 'grey' : getButtonColor('position'),
                      },
                    }}
                  >
                    <Grid4x4Sharp />
                  </Button>

                  <Button
                    onClick={handleAudioMatch}
                    id="audio-btn"
                    sx={{
                      px: 6, // Matches padding of start and pause buttons
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      backgroundColor: getButtonColor('audio'),
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: getButtonColor('audio') === 'darkgrey' ? 'grey' : getButtonColor('audio'),
                      },
                    }}
                  >
                    <VolumeUpIcon />
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          

          <Divider sx={{ my: 3 }} />    

          {/* Quick Settings */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`${state.nLevel}-Back`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`Round ${state.currentRound}`}
                variant="outlined"
              />
              {settings.showVisual && <Chip label="Visual" size="small" color="primary" variant="outlined" />}
              {settings.showAudio && <Chip label="Audio" size="small" color="secondary" variant="outlined" />}
            </Box>
            
            <Tooltip title="Quick Settings">
              <IconButton
                onClick={() => setShowQuickSettings(true)}
                disabled={state.isPlaying}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>


        {/* Quick Settings Dialog */}
        <Dialog
          open={showQuickSettings}
          onClose={() => setShowQuickSettings(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Quick Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography gutterBottom>N-Back Level: {settings.nLevel}</Typography>
              <Slider
                value={settings.nLevel}
                onChange={(_, value) => updateSettings({ nLevel: value as number })}
                min={1}
                max={8}
                step={1}
                marks
                disabled={state.isPlaying}
              />
              
              <Typography gutterBottom sx={{ mt: 3 }}>Rounds: {settings.totalRounds}</Typography>
              <Slider
                value={settings.totalRounds}
                onChange={(_, value) => updateSettings({ totalRounds: value as number })}
                min={10}
                max={50}
                step={5}
                marks={[
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 30, label: '30' },
                  { value: 40, label: '40' },
                  { value: 50, label: '50' },
                ]}
                disabled={state.isPlaying}
              />
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showVisual}
                      onChange={(e) => updateSettings({ showVisual: e.target.checked })}
                      disabled={state.isPlaying}
                    />
                  }
                  label="Visual Stimuli"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showAudio}
                      onChange={(e) => updateSettings({ showAudio: e.target.checked })}
                      disabled={state.isPlaying}
                    />
                  }
                  label="Audio Stimuli"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuickSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}

export default GameControls

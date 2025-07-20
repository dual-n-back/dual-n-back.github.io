import React, { useState, useEffect, useCallback } from 'react'
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
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  TouchApp as PositionIcon,
  VolumeUp as AudioIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useGame } from '../../contexts/GameContext'
import { useStats } from '../../contexts/StatsContext'
import { generateSessionId } from '../../utils/gameLogic'

const GameControls: React.FC = () => {
  const { state, settings, startGame, pauseGame, resumeGame, stopGame, resetGame, updateSettings, submitResponse } = useGame()
  const { addGameSession } = useStats()
  const theme = useTheme()
  
  const [showQuickSettings, setShowQuickSettings] = useState(false)

  const handlePositionMatch = () => {
    if (state.gamePhase === 'response') {
      submitResponse(true, null)
    }
  }

  const handleAudioMatch = () => {
    if (state.gamePhase === 'response') {
      submitResponse(null, true)
    }
  }

  const handleNoMatch = () => {
    if (state.gamePhase === 'response') {
      submitResponse(false, false)
    }
  }

  const handleGameComplete = useCallback(() => {
    if (state.gameStartTime && state.gameEndTime) {
      const session = {
        id: generateSessionId(),
        date: Date.now(),
        nLevel: state.nLevel,
        totalRounds: state.currentRound,
        completedRounds: state.currentRound,
        score: state.score,
        duration: state.gameEndTime - state.gameStartTime,
        settings,
        responses: [], // This would be populated with actual response data
        completed: state.gamePhase === 'completed',
      }
      addGameSession(session)
    }
  }, [state.gameStartTime, state.gameEndTime, state.nLevel, state.currentRound, state.score, state.gamePhase, settings, addGameSession])

  // Handle game completion
  useEffect(() => {
    if (state.gamePhase === 'completed' && state.gameEndTime) {
      handleGameComplete()
    }
  }, [state.gamePhase, state.gameEndTime, handleGameComplete])

  const canStart = !state.isPlaying
  const canPause = state.isPlaying && !state.isPaused
  const canResume = state.isPlaying && state.isPaused
  const canStop = state.isPlaying

  return (
    <Fade in={true}>
      <Box>
        {/* Main Control Panel */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
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
              
              {canPause && (
                <Button
                  onClick={pauseGame}
                  startIcon={<PauseIcon />}
                  color="warning"
                  sx={{ px: 3, py: 1.5 }}
                >
                  Pause
                </Button>
              )}
              
              {canResume && (
                <Button
                  onClick={resumeGame}
                  startIcon={<PlayIcon />}
                  color="success"
                  sx={{ px: 3, py: 1.5 }}
                >
                  Resume
                </Button>
              )}
              
              {canStop && (
                <Button
                  onClick={stopGame}
                  startIcon={<StopIcon />}
                  color="error"
                  sx={{ px: 3, py: 1.5 }}
                >
                  Stop
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
          {state.gamePhase === 'response' && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 600 }}>
                  Did it match {state.nLevel} steps back?
                </Typography>
                
                {/* Touch/Click Response Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                  {settings.showVisual && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Position
                      </Typography>
                      <ButtonGroup orientation="vertical" size="large">
                        <Button
                          onClick={handlePositionMatch}
                          startIcon={<PositionIcon />}
                          color="success"
                          variant="contained"
                          sx={{ minWidth: 120, py: 1.5 }}
                        >
                          Match
                        </Button>
                        <Button
                          onClick={handleNoMatch}
                          color="error"
                          variant="outlined"
                          sx={{ minWidth: 120, py: 1.5 }}
                        >
                          No Match
                        </Button>
                      </ButtonGroup>
                    </Box>
                  )}
                  
                  {settings.showAudio && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" gutterBottom color="secondary">
                        Audio
                      </Typography>
                      <ButtonGroup orientation="vertical" size="large">
                        <Button
                          onClick={handleAudioMatch}
                          startIcon={<AudioIcon />}
                          color="success"
                          variant="contained"
                          sx={{ minWidth: 120, py: 1.5 }}
                        >
                          Match
                        </Button>
                        <Button
                          onClick={handleNoMatch}
                          color="error"
                          variant="outlined"
                          sx={{ minWidth: 120, py: 1.5 }}
                        >
                          No Match
                        </Button>
                      </ButtonGroup>
                    </Box>
                  )}
                </Box>
                
                {/* Keyboard Controls Info */}
                <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Keyboard Shortcuts (Desktop)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                    {settings.showVisual && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Position Match:</strong> A or ← 
                      </Typography>
                    )}
                    
                    {settings.showAudio && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Audio Match:</strong> L or →
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      <strong>No Match:</strong> Space or N
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* Game Instructions */}
          {state.isPlaying && state.gamePhase !== 'response' && (
            <Fade in={true}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {state.gamePhase === 'stimulus' && `Showing stimulus ${state.currentStimulusIndex + 1} of ${state.sequence.length}`}
                  {state.gamePhase === 'waiting' && 'Preparing next stimulus...'}
                  {state.gamePhase === 'feedback' && 'Processing your response...'}
                </Typography>
                
                {state.currentStimulusIndex < state.nLevel && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Responses start after stimulus {state.nLevel + 1} (need {state.nLevel + 1 - state.currentStimulusIndex - 1} more)
                  </Typography>
                )}
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
        </Paper>

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

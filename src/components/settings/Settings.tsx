import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Slider,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  alpha,
  Fade,
} from '@mui/material'
import {
  Download as ExportIcon,
  Upload as ImportIcon,
  DeleteForever as ClearIcon,
  Science as TestIcon,
} from '@mui/icons-material'
import { useGameStore } from '../../stores/gameStore'
import { useStatsStore } from '../../stores/statsStore'
import { testAudio, preloadAudio } from '../../utils/audioManager'

const Settings: React.FC = () => {
  const { settings, updateSettings, adaptiveMode, toggleAdaptiveMode } = useGameStore()
  const { clearStats, exportStats, importStats } = useStatsStore()
  const theme = useTheme()
  
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const volume = (value as number) / 100
    updateSettings({ volume })
  }

  const handleTestAudio = async () => {
    try {
      await preloadAudio()
      await testAudio(settings.audioType, settings.volume)
    } catch (error) {
      console.error('Audio test failed:', error)
    }
  }

  const handleExportStats = () => {
    const data = exportStats()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dual-n-back-stats-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportStats = () => {
    try {
      importStats(importData)
      setShowImportDialog(false)
      setImportData('')
      setImportError('')
    } catch (error) {
      setImportError('Invalid data format. Please check your file and try again.')
    }
  }

  const handleClearStats = () => {
    clearStats()
    setShowClearDialog(false)
  }

  return (
    <Fade in={true}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Game Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Game Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Game Configuration
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>N-Back Level: {settings.nLevel}</Typography>
                <Slider
                  value={settings.nLevel}
                  onChange={(_, value) => updateSettings({ nLevel: value as number })}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 3, label: '3' },
                    { value: 5, label: '5' },
                    { value: 7, label: '7' },
                    { value: 10, label: '10' },
                  ]}
                  sx={{ mb: 3 }}
                />

                <Typography gutterBottom>Total Rounds: {settings.totalRounds}</Typography>
                <Slider
                  value={settings.totalRounds}
                  onChange={(_, value) => updateSettings({ totalRounds: value as number })}
                  min={10}
                  max={100}
                  step={5}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 75, label: '75' },
                    { value: 100, label: '100' },
                  ]}
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Grid Size</InputLabel>
                  <Select
                    value={settings.gridSize}
                    label="Grid Size"
                    onChange={(e) => updateSettings({ gridSize: e.target.value as 3 | 4 | 5 })}
                  >
                    <MenuItem value={3}>3x3 (9 positions)</MenuItem>
                    <MenuItem value={4}>4x4 (16 positions)</MenuItem>
                    <MenuItem value={5}>5x5 (25 positions)</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showVisual}
                        onChange={(e) => updateSettings({ showVisual: e.target.checked })}
                      />
                    }
                    label="Visual Stimuli"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showAudio}
                        onChange={(e) => updateSettings({ showAudio: e.target.checked })}
                      />
                    }
                    label="Audio Stimuli"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoAdvance}
                        onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                      />
                    }
                    label="Auto-advance to next stimulus"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={adaptiveMode}
                        onChange={toggleAdaptiveMode}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography component="span">🧠 Adaptive Difficulty</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          AI adjusts difficulty based on your performance
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Audio Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Audio Configuration
              </Typography>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Audio Type</InputLabel>
                  <Select
                    value={settings.audioType}
                    label="Audio Type"
                    onChange={(e) => updateSettings({ audioType: e.target.value as 'tones' | 'letters' | 'numbers' })}
                  >
                    <MenuItem value="tones">Musical Tones</MenuItem>
                    <MenuItem value="letters">Spoken Letters</MenuItem>
                    <MenuItem value="numbers">Spoken Numbers</MenuItem>
                  </Select>
                </FormControl>

                <Typography gutterBottom>Volume: {Math.round(settings.volume * 100)}%</Typography>
                <Slider
                  value={settings.volume * 100}
                  onChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ]}
                  sx={{ mb: 3 }}
                />

                <Button
                  variant="outlined"
                  startIcon={<TestIcon />}
                  onClick={handleTestAudio}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Test Audio
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Timing Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Timing Configuration
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Stimulus Duration: {settings.stimulusDuration}ms
                </Typography>
                <Slider
                  value={settings.stimulusDuration}
                  onChange={(_, value) => updateSettings({ stimulusDuration: value as number })}
                  min={200}
                  max={2000}
                  step={100}
                  marks={[
                    { value: 200, label: '200ms' },
                    { value: 500, label: '500ms' },
                    { value: 1000, label: '1s' },
                    { value: 2000, label: '2s' },
                  ]}
                  sx={{ mb: 3 }}
                />

                <Typography gutterBottom>
                  Interstimulus Interval: {settings.interstimulusInterval}ms
                </Typography>
                <Slider
                  value={settings.interstimulusInterval}
                  onChange={(_, value) => updateSettings({ interstimulusInterval: value as number })}
                  min={1000}
                  max={5000}
                  step={250}
                  marks={[
                    { value: 1000, label: '1s' },
                    { value: 2500, label: '2.5s' },
                    { value: 4000, label: '4s' },
                    { value: 5000, label: '5s' },
                  ]}
                  sx={{ mb: 3 }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Data Management */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Data Management
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExportStats}
                  fullWidth
                >
                  Export Statistics
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  onClick={() => setShowImportDialog(true)}
                  fullWidth
                >
                  Import Statistics
                </Button>

                <Divider />

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={() => setShowClearDialog(true)}
                  fullWidth
                >
                  Clear All Data
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Clear Data Confirmation Dialog */}
        <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
          <DialogTitle>Clear All Data</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to clear all your statistics and achievements? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
            <Button onClick={handleClearStats} color="error" variant="contained">
              Clear All Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Import Statistics</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Paste your exported statistics data below:
            </Typography>
            <TextField
              multiline
              rows={10}
              fullWidth
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON data here..."
              sx={{ mt: 2 }}
            />
            {importError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {importError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleImportStats} 
              variant="contained"
              disabled={!importData.trim()}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}

export default Settings

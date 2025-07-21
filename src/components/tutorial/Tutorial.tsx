import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material'
import {
  Psychology as BrainIcon,
  Visibility as VisualIcon,
  VolumeUp as AudioIcon,
  TouchApp as TouchIcon,
  TrendingUp as ProgressIcon,
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'

const tutorialSteps = [
  {
    label: 'What is Dual N-Back?',
    content: (
      <Box>
        <Typography paragraph>
          Dual N-Back is a cognitive training exercise designed to improve your working memory. 
          It challenges you to remember both visual positions and audio stimuli from N steps back in a sequence.
        </Typography>
        <Card elevation={1} sx={{ mt: 2, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧠 Why Train Working Memory?
            </Typography>
            <Typography variant="body2">
              Working memory is crucial for reasoning, learning, and comprehension. 
              Studies suggest that Dual N-Back training may improve fluid intelligence and cognitive performance.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    ),
  },
  {
    label: 'Understanding the Game',
    content: (
      <Box>
        <Typography paragraph>
          In Dual N-Back, you'll see a sequence of visual stimuli (squares lighting up on a grid) 
          and hear audio stimuli (tones, letters, or numbers). Your task is to identify when the 
          current stimulus matches the one from N steps back.
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VisualIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Visual Task</Typography>
                </Box>
                <Typography variant="body2">
                  Watch squares light up on a 3x3 grid. Remember their positions and identify 
                  when a position matches the one from N steps back.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AudioIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Audio Task</Typography>
                </Box>
                <Typography variant="body2">
                  Listen to tones, letters, or numbers. Remember the sounds and identify 
                  when a sound matches the one from N steps back.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    ),
  },
  {
    label: 'How to Play',
    content: (
      <Box>
        <Typography paragraph>
          Here's how to play step by step:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="1. Choose your N-level"
              secondary="Start with 2-back for beginners. As you improve, increase the level."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="2. Watch and listen"
              secondary="Pay attention to both visual positions and audio stimuli as they appear."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="3. Make decisions"
              secondary="For each stimulus, decide if it matches the one from N steps back."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="4. Respond quickly"
              secondary="Click 'Match' or 'No Match' for both position and audio (if enabled)."
            />
          </ListItem>
        </List>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> You can't make decisions for the first N stimuli since there's nothing to compare them to.
          </Typography>
        </Alert>
      </Box>
    ),
  },
  {
    label: 'Controls and Interface',
    content: (
      <Box>
        <Typography paragraph>
          Familiarize yourself with the game controls:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TouchIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Response Controls</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label="🔲 Position Match" color="primary" size="small" />
                  <Chip label="🔊 Audio Match" color="secondary" size="small" />
                </Box>
                <Typography variant="body2">
                  Click the grid icon for position matches or speaker icon for audio matches. 
                  Buttons change color based on feedback (green=correct, red=incorrect).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          

          
          <Grid item xs={12}>
            <Card elevation={1} sx={{ backgroundColor: alpha('#2196f3', 0.05) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BrainIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">🧠 NEW: Adaptive Difficulty</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Revolutionary AI-powered training system (enabled by default):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label="📊 Real-time Analysis" color="info" size="small" />
                  <Chip label="🎯 Dynamic Adjustment" color="info" size="small" />
                  <Chip label="🔔 Bell Curve Distribution" color="info" size="small" />
                  <Chip label="⚡ Performance Tracking" color="info" size="small" />
                </Box>
                <Typography variant="body2">
                  The system automatically adjusts difficulty based on your performance, 
                  prevents pattern clustering, and provides research-based ADHD benefits. 
                  Toggle in Settings → Advanced Options.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    ),
  },
  {
    label: 'Tips for Success',
    content: (
      <Box>
        <Typography paragraph>
          Follow these tips to improve your performance:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <TipIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Start with 2-back"
              secondary="Don't rush to higher levels. Master 2-back with 80%+ accuracy before advancing."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TipIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Practice regularly"
              secondary="15-20 minutes daily is more effective than longer, infrequent sessions."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TipIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Stay focused"
              secondary="Minimize distractions and maintain concentration throughout the session."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TipIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Use strategies"
              secondary="Develop mental strategies like visualization or chunking to remember sequences."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TipIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Be patient"
              secondary="Cognitive improvements take time. Don't get discouraged by initial difficulty."
            />
          </ListItem>
        </List>
        
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Remember:</strong> The goal is improvement over time, not perfect performance immediately.
          </Typography>
        </Alert>
      </Box>
    ),
  },
  {
    label: 'Tracking Progress',
    content: (
      <Box>
        <Typography paragraph>
          Monitor your improvement with the built-in statistics:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ProgressIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Key Metrics</Typography>
                </Box>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Accuracy Percentage"
                      secondary="Aim for 80%+ before advancing levels"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Training Streak"
                      secondary="Maintain daily practice for best results"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="N-Level Progress"
                      secondary="Track performance at each difficulty"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BrainIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Achievements</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Unlock achievements as you reach milestones:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="🎯 First Steps" size="small" />
                  <Chip label="🏆 Perfect Mind" size="small" />
                  <Chip label="💪 Dedicated Trainer" size="small" />
                  <Chip label="🧠 Memory Master" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    ),
  },
]

const Tutorial: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const theme = useTheme()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <Fade in={true}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          How to Play Dual N-Back
        </Typography>

        <Paper
          elevation={2}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
            {tutorialSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Zoom in={activeStep === index} timeout={300}>
                    <Box sx={{ py: 2 }}>
                      {step.content}
                      
                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mr: 1 }}
                          disabled={activeStep === tutorialSteps.length - 1}
                        >
                          {activeStep === tutorialSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                      </Box>
                    </Box>
                  </Zoom>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === tutorialSteps.length && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                m: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                🎉 You're Ready to Train!
              </Typography>
              <Typography paragraph>
                You've completed the tutorial. Now you're ready to start training your brain 
                with Dual N-Back. Remember to practice regularly and be patient with your progress.
              </Typography>
              <Button
                onClick={handleReset}
                variant="contained"
                sx={{
                  mr: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Review Tutorial
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                onClick={() => {
                  // This would navigate to the game view
                  console.log('Navigate to game')
                }}
              >
                Start Training
              </Button>
            </Paper>
          )}
        </Paper>
      </Box>
    </Fade>
  )
}

export default Tutorial

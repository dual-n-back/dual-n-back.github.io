import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  alpha,
  Fade,
} from '@mui/material'
import {
  TrendingUp as TrendIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Psychology as BrainIcon,
  Whatshot as StreakIcon,
} from '@mui/icons-material'
import { useStatsStore } from '../../stores/statsStore'
import { formatDuration, formatPercentage, getDifficultyLevel } from '../../utils/gameLogic'

const StatsPanel: React.FC = () => {
  const { stats, achievements } = useStatsStore()
  const theme = useTheme()

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <Fade in={true}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Your Training Statistics
        </Typography>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <BrainIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.totalGamesPlayed}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Games Played
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatPercentage(stats.averageScore)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Average Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <StreakIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.currentStreak}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Day Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <TimeIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatDuration(stats.totalPlayTime)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* N-Level Progress */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BrainIcon color="primary" />
                N-Back Level Progress
              </Typography>
              
              {Object.keys(stats.nLevelProgress).length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No training data yet. Start playing to see your progress!
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(stats.nLevelProgress)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([level, progress]) => (
                      <Box key={level} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${level}-Back`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip
                              label={getDifficultyLevel(parseInt(level))}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {progress.gamesPlayed} games
                          </Typography>
                        </Box>
                        
                        <LinearProgress
                          variant="determinate"
                          value={progress.averageScore}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                            },
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Avg: {formatPercentage(progress.averageScore)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Best: {formatPercentage(progress.bestScore)}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  }
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon color="warning" />
                Achievements ({unlockedAchievements.length}/{achievements.length})
              </Typography>
              
              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {unlockedAchievements.map((achievement) => (
                  <ListItem key={achievement.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Typography sx={{ fontSize: '1.5rem' }}>{achievement.icon}</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.name}
                      secondary={achievement.description}
                      primaryTypographyProps={{ fontWeight: 600, color: 'success.main' }}
                    />
                  </ListItem>
                ))}
                
                {unlockedAchievements.length > 0 && lockedAchievements.length > 0 && (
                  <Divider sx={{ my: 2 }} />
                )}
                
                {lockedAchievements.map((achievement) => (
                  <ListItem key={achievement.id} sx={{ px: 0, opacity: 0.6 }}>
                    <ListItemIcon>
                      <Typography sx={{ fontSize: '1.5rem', filter: 'grayscale(1)' }}>
                        {achievement.icon}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.name}
                      secondary={achievement.description}
                      primaryTypographyProps={{ color: 'text.secondary' }}
                      secondaryTypographyProps={{ color: 'text.disabled' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                background: alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Training Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                      {formatPercentage(stats.bestScore)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Best Score
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main" sx={{ fontWeight: 600 }}>
                      {stats.longestStreak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Longest Streak
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                      {stats.sessions.length > 0 ? Math.max(...Object.keys(stats.nLevelProgress).map(Number)) : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Highest N-Level
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 600 }}>
                      {stats.sessions.filter(s => s.completed).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Games
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}

export default StatsPanel

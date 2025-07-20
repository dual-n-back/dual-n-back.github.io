import React from 'react'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material'
import {
  SportsEsports as GameIcon,
  Analytics as StatsIcon,
  Settings as SettingsIcon,
  School as TutorialIcon,
} from '@mui/icons-material'

interface NavigationProps {
  currentView: 'game' | 'stats' | 'settings' | 'tutorial'
  onViewChange: (view: 'game' | 'stats' | 'settings' | 'tutorial') => void
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const theme = useTheme()

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onViewChange(newValue as 'game' | 'stats' | 'settings' | 'tutorial')
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Tabs
          value={currentView}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab
            label="Game"
            value="game"
            icon={<GameIcon />}
            iconPosition="start"
            sx={{
              gap: 1,
            }}
          />
          <Tab
            label="Statistics"
            value="stats"
            icon={<StatsIcon />}
            iconPosition="start"
            sx={{
              gap: 1,
            }}
          />
          <Tab
            label="Settings"
            value="settings"
            icon={<SettingsIcon />}
            iconPosition="start"
            sx={{
              gap: 1,
            }}
          />
          <Tab
            label="Tutorial"
            value="tutorial"
            icon={<TutorialIcon />}
            iconPosition="start"
            sx={{
              gap: 1,
            }}
          />
        </Tabs>
      </Paper>
    </Box>
  )
}

export default Navigation

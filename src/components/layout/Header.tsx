import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Psychology as BrainIcon,
  GitHub as GitHubIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

const Header: React.FC = () => {
  const theme = useTheme()

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BrainIcon sx={{ fontSize: 32, color: 'white' }} />
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: 'white',
                lineHeight: 1.2,
              }}
            >
              Dual N-Back
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: '0.875rem',
              }}
            >
              Brain Training Game
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="About this game">
            <IconButton
              size="medium"
              sx={{ color: 'white' }}
              onClick={() => {
                window.open('https://en.wikipedia.org/wiki/N-back', '_blank')
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View source on GitHub">
            <IconButton
              size="medium"
              sx={{ color: 'white' }}
              onClick={() => {
                window.open('https://github.com/dual-n-back/dual-n-back.github.io', '_blank')
              }}
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header

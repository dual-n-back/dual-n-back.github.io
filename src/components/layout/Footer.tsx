import React from 'react'
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  useTheme,
  alpha,
} from '@mui/material'
import { Psychology as BrainIcon } from '@mui/icons-material'

const Footer: React.FC = () => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrainIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Dual N-Back Brain Training
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 1, sm: 3 },
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} Dual N-Back Team
            </Typography>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link
                href="https://github.com/dual-n-back/dual-n-back.github.io"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Source Code
              </Link>
              <Link
                href="https://en.wikipedia.org/wiki/N-back"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                About N-Back
              </Link>
            </Box>
          </Box>
        </Box>

      </Container>
    </Box>
  )
}

export default Footer

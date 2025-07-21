import { useState } from 'react'
import { Box, Container } from '@mui/material'
import { useGameFlow } from './hooks/useGameFlow'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import GameBoard from './components/game/GameBoard'
import GameControls from './components/game/GameControls'
import StatsPanel from './components/stats/StatsPanel'
import Settings from './components/settings/Settings'
import Tutorial from './components/tutorial/Tutorial'
import Footer from './components/layout/Footer'

type ViewType = 'game' | 'stats' | 'settings' | 'tutorial'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('game')
  
  // Initialize game flow (timers and keyboard controls)
  useGameFlow()

  const renderCurrentView = () => {
    switch (currentView) {
      case 'game':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <GameBoard />
            <GameControls />
          </Box>
        )
      case 'stats':
        return <StatsPanel />
      case 'settings':
        return <Settings />
      case 'tutorial':
        return <Tutorial />
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderCurrentView()}
      </Container>
      
      <Footer />
    </Box>
  )
}

export default App

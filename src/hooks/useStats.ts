import { useContext } from 'react'
import { StatsContext } from '../contexts/StatsContext'

export const useStats = () => {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}

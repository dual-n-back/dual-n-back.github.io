import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Statistics, GameSession, Achievement } from '../types/game'

interface StatsContextType {
  stats: Statistics
  achievements: Achievement[]
  addGameSession: (session: GameSession) => void
  clearStats: () => void
  exportStats: () => string
  importStats: (data: string) => void
}

type StatsAction = 
  | { type: 'ADD_SESSION'; payload: GameSession }
  | { type: 'CLEAR_STATS' }
  | { type: 'LOAD_STATS'; payload: Statistics }
  | { type: 'UPDATE_ACHIEVEMENTS'; payload: Achievement[] }

// Achievement condition functions - these don't get serialized to localStorage
const achievementConditions: Record<string, (stats: Statistics, session?: GameSession) => boolean> = {
  first_game: (stats) => stats.totalGamesPlayed >= 1,
  perfect_score: (_, session) => session ? 
    (session.score.totalCorrect / (session.score.totalCorrect + session.score.totalIncorrect)) === 1 : false,
  ten_games: (stats) => stats.totalGamesPlayed >= 10,
  level_5: (stats) => Object.keys(stats.nLevelProgress).some(level => 
    parseInt(level) >= 5 && stats.nLevelProgress[parseInt(level)].gamesPlayed > 0
  ),
  streak_7: (stats) => stats.currentStreak >= 7,
  hour_played: (stats) => stats.totalPlayTime >= 3600000, // 1 hour in milliseconds
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Complete your first Dual N-Back session',
    icon: '🎯',
    condition: achievementConditions.first_game,
    unlocked: false,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Mind',
    description: 'Achieve 100% accuracy in a session',
    icon: '🏆',
    condition: achievementConditions.perfect_score,
    unlocked: false,
  },
  {
    id: 'ten_games',
    name: 'Dedicated Trainer',
    description: 'Complete 10 training sessions',
    icon: '💪',
    condition: achievementConditions.ten_games,
    unlocked: false,
  },
  {
    id: 'level_5',
    name: 'Memory Master',
    description: 'Successfully complete a 5-back session',
    icon: '🧠',
    condition: achievementConditions.level_5,
    unlocked: false,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day training streak',
    icon: '🔥',
    condition: achievementConditions.streak_7,
    unlocked: false,
  },
  {
    id: 'hour_played',
    name: 'Time Invested',
    description: 'Spend over 1 hour training your brain',
    icon: '⏰',
    condition: achievementConditions.hour_played,
    unlocked: false,
  },
]

// Function to restore condition functions after loading from localStorage
const restoreAchievementConditions = (achievements: Achievement[]): Achievement[] => {
  return achievements.map(achievement => ({
    ...achievement,
    condition: achievementConditions[achievement.id] || (() => false),
  }))
}

const initialStats: Statistics = {
  sessions: [],
  totalGamesPlayed: 0,
  averageScore: 0,
  bestScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPlayTime: 0,
  nLevelProgress: {},
}

const calculateStats = (sessions: GameSession[]): Statistics => {
  if (sessions.length === 0) {
    return initialStats
  }

  const completedSessions = sessions.filter(s => s.completed)
  const scores = completedSessions.map(s => 
    s.score.totalCorrect / (s.score.totalCorrect + s.score.totalIncorrect) * 100
  )

  const totalPlayTime = completedSessions.reduce((sum, s) => sum + s.duration, 0)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0

  // Calculate streaks (simplified - consecutive days)
  const dates = completedSessions.map(s => new Date(s.date).toDateString()).sort()
  const uniqueDates = [...new Set(dates)]
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i])
    const prevDate = i > 0 ? new Date(uniqueDates[i - 1]) : null
    
    if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 86400000) {
      tempStreak++
    } else {
      tempStreak = 1
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)
    
    // Current streak calculation (from today backwards)
    const today = new Date().toDateString()
    if (i === uniqueDates.length - 1 && uniqueDates[i] === today) {
      currentStreak = tempStreak
    }
  }

  // N-level progress
  const nLevelProgress: Statistics['nLevelProgress'] = {}
  completedSessions.forEach(session => {
    const level = session.nLevel
    if (!nLevelProgress[level]) {
      nLevelProgress[level] = {
        gamesPlayed: 0,
        averageScore: 0,
        bestScore: 0,
        lastPlayed: 0,
      }
    }
    
    const levelStats = nLevelProgress[level]
    const sessionScore = session.score.totalCorrect / (session.score.totalCorrect + session.score.totalIncorrect) * 100
    
    levelStats.gamesPlayed++
    levelStats.averageScore = (levelStats.averageScore * (levelStats.gamesPlayed - 1) + sessionScore) / levelStats.gamesPlayed
    levelStats.bestScore = Math.max(levelStats.bestScore, sessionScore)
    levelStats.lastPlayed = Math.max(levelStats.lastPlayed, session.date)
  })

  return {
    sessions: completedSessions,
    totalGamesPlayed: completedSessions.length,
    averageScore,
    bestScore,
    currentStreak,
    longestStreak,
    totalPlayTime,
    nLevelProgress,
  }
}

const statsReducer = (state: Statistics, action: StatsAction): Statistics => {
  switch (action.type) {
    case 'ADD_SESSION': {
      const newSessions = [...state.sessions, action.payload]
      return calculateStats(newSessions)
    }

    case 'CLEAR_STATS':
      return initialStats

    case 'LOAD_STATS':
      return action.payload

    default:
      return state
  }
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, dispatch] = useReducer(statsReducer, initialStats)
  const [achievements, setAchievements] = React.useState<Achievement[]>(defaultAchievements)

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('dual-n-back-stats')
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats)
        dispatch({ type: 'LOAD_STATS', payload: parsedStats })
      } catch (error) {
        console.error('Failed to load stats from localStorage:', error)
      }
    }

    const savedAchievements = localStorage.getItem('dual-n-back-achievements')
    if (savedAchievements) {
      try {
        const parsedAchievements = JSON.parse(savedAchievements)
        const restoredAchievements = restoreAchievementConditions(parsedAchievements)
        setAchievements(restoredAchievements)
      } catch (error) {
        console.error('Failed to load achievements from localStorage:', error)
      }
    }
  }, [])

  // Save stats to localStorage when stats change
  useEffect(() => {
    localStorage.setItem('dual-n-back-stats', JSON.stringify(stats))
  }, [stats])

  // Save achievements to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dual-n-back-achievements', JSON.stringify(achievements))
  }, [achievements])

  // Check for new achievements when stats change
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition && achievement.condition(stats)) {
        return {
          ...achievement,
          unlocked: true,
          unlockedDate: Date.now(),
        }
      }
      return achievement
    })

    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements)
    }
  }, [stats, achievements])

  const addGameSession = useCallback((session: GameSession) => {
    dispatch({ type: 'ADD_SESSION', payload: session })
    
    // Check for session-specific achievements
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition && achievement.condition(stats, session)) {
        return {
          ...achievement,
          unlocked: true,
          unlockedDate: Date.now(),
        }
      }
      return achievement
    })
    
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements)
    }
  }, [stats, achievements])

  const clearStats = useCallback(() => {
    dispatch({ type: 'CLEAR_STATS' })
    setAchievements(defaultAchievements)
    localStorage.removeItem('dual-n-back-stats')
    localStorage.removeItem('dual-n-back-achievements')
  }, [])

  const exportStats = useCallback(() => {
    return JSON.stringify({ stats, achievements }, null, 2)
  }, [stats, achievements])

  const importStats = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.stats) {
        dispatch({ type: 'LOAD_STATS', payload: parsed.stats })
      }
      if (parsed.achievements) {
        const restoredAchievements = restoreAchievementConditions(parsed.achievements)
        setAchievements(restoredAchievements)
      }
    } catch (error) {
      console.error('Failed to import stats:', error)
      throw new Error('Invalid stats data format')
    }
  }, [])

  const value: StatsContextType = {
    stats,
    achievements,
    addGameSession,
    clearStats,
    exportStats,
    importStats,
  }

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export const useStats = () => {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}

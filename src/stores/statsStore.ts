import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Statistics, GameSession, Achievement } from '../types/game'

// Achievement condition functions - these don't get serialized to localStorage
const achievementConditions: Record<string, (stats: Statistics, session?: GameSession) => boolean> = {
  first_game: (stats) => stats.totalGamesPlayed >= 1,
  perfect_score: (_, session) => session ? 
    (session.score.totalCorrect / (session.score.totalCorrect + session.score.totalIncorrect + session.score.totalMissed)) === 1 : false,
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
  const scores = completedSessions.map(s => {
    const totalAttempts = s.score.totalCorrect + s.score.totalIncorrect + s.score.totalMissed
    return totalAttempts > 0 ? (s.score.totalCorrect / totalAttempts * 100) : 0
  })

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
    const totalAttempts = session.score.totalCorrect + session.score.totalIncorrect + session.score.totalMissed
    const sessionScore = totalAttempts > 0 ? (session.score.totalCorrect / totalAttempts * 100) : 0
    
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

interface StatsStore {
  stats: Statistics
  achievements: Achievement[]
  
  // Actions
  addGameSession: (session: GameSession) => void
  clearStats: () => void
  exportStats: () => string
  importStats: (data: string) => void
  
  // Internal methods
  updateAchievements: (newSession?: GameSession) => void
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      achievements: defaultAchievements,

      addGameSession: (session) => {
        const currentStats = get().stats
        const newSessions = [...currentStats.sessions, session]
        const updatedStats = calculateStats(newSessions)
        
        set({ stats: updatedStats })
        
        // Check for achievements after updating stats
        get().updateAchievements(session)
      },

      clearStats: () => {
        set({ 
          stats: initialStats, 
          achievements: defaultAchievements.map(a => ({ ...a, unlocked: false, unlockedDate: undefined }))
        })
      },

      exportStats: () => {
        const { stats, achievements } = get()
        return JSON.stringify({ stats, achievements }, null, 2)
      },

      importStats: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.stats) {
            set({ stats: parsed.stats })
          }
          if (parsed.achievements) {
            const restoredAchievements = restoreAchievementConditions(parsed.achievements)
            set({ achievements: restoredAchievements })
          }
        } catch (error) {
          console.error('Failed to import stats:', error)
          throw new Error('Invalid stats data format')
        }
      },

      updateAchievements: (newSession) => {
        const { stats, achievements } = get()
        
        const updatedAchievements = achievements.map(achievement => {
          if (!achievement.unlocked && achievement.condition) {
            // Check both general stats and session-specific conditions
            const shouldUnlock = achievement.condition(stats, newSession) || achievement.condition(stats)
            
            if (shouldUnlock) {
              return {
                ...achievement,
                unlocked: true,
                unlockedDate: Date.now(),
              }
            }
          }
          return achievement
        })

        // Only update if there are changes
        const hasChanges = updatedAchievements.some((achievement, index) => 
          achievement.unlocked !== achievements[index].unlocked
        )

        if (hasChanges) {
          set({ achievements: updatedAchievements })
        }
      },
    }),
    {
      name: 'dual-n-back-stats',
      partialize: (state) => ({
        stats: state.stats,
        achievements: state.achievements.map(a => ({
          ...a,
          condition: undefined, // Don't persist functions
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.achievements) {
          // Restore condition functions after hydration
          state.achievements = restoreAchievementConditions(state.achievements)
        }
      },
    }
  )
)

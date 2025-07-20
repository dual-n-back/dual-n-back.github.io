export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  currentRound: number
  totalRounds: number
  nLevel: number
  sequence: GameSequence[]
  currentStimulusIndex: number
  gamePhase: GamePhase
  waitingForResponse: boolean
  responseDeadline: number | null
  score: {
    positionCorrect: number
    positionIncorrect: number
    audioCorrect: number
    audioIncorrect: number
    totalCorrect: number
    totalIncorrect: number
  }
  gameStartTime: number | null
  gameEndTime: number | null
}

export interface GameSequence {
  position: number // 0-8 for 3x3 grid
  audio: number // 0-7 for different audio tones
  timestamp: number
}

export interface GameSettings {
  nLevel: number
  totalRounds: number
  showVisual: boolean
  showAudio: boolean
  stimulusDuration: number // milliseconds
  interstimulusInterval: number // milliseconds
  gridSize: 3 | 4 | 5
  audioType: 'tones' | 'letters' | 'numbers'
  volume: number
  autoAdvance: boolean
}

export interface UserResponse {
  position: boolean | null // true = match, false = no match, null = no response
  audio: boolean | null
  responseTime: number
  roundIndex: number
}

export interface GameSession {
  id: string
  date: number
  nLevel: number
  totalRounds: number
  completedRounds: number
  score: GameState['score']
  duration: number // milliseconds
  settings: GameSettings
  responses: UserResponse[]
  completed: boolean
}

export interface Statistics {
  sessions: GameSession[]
  totalGamesPlayed: number
  averageScore: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  totalPlayTime: number // milliseconds
  nLevelProgress: Record<number, {
    gamesPlayed: number
    averageScore: number
    bestScore: number
    lastPlayed: number
  }>
}

export interface AudioTone {
  frequency: number
  type: 'sine' | 'square' | 'triangle' | 'sawtooth'
  name: string
}

export interface GridPosition {
  row: number
  col: number
  index: number
}

export type GamePhase = 'waiting' | 'stimulus' | 'response' | 'feedback' | 'completed'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: Statistics, session?: GameSession) => boolean
  unlocked: boolean
  unlockedDate?: number
}

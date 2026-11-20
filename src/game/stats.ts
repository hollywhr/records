// Player statistics and saved progress, kept in the browser's localStorage
// (no accounts, no server — ADR-0002: a static GitHub Pages site).

import { MAX_GUESSES } from './game'

export interface Stats {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
  /** distribution[i] = games won in i+1 guesses */
  distribution: number[]
  /** puzzle number of the last daily game that was finished (won or lost) */
  lastCompleted: number | null
  /** puzzle number of the last daily game that was won */
  lastWon: number | null
}

export function emptyStats(): Stats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: new Array<number>(MAX_GUESSES).fill(0),
    lastCompleted: null,
    lastWon: null,
  }
}

/**
 * Record a finished daily game. Recording the same puzzle twice is a no-op:
 * the page restores a finished game on reload, and that must not count as
 * another game played.
 */
export function recordResult(stats: Stats, puzzle: number, won: boolean, guessCount: number): Stats {
  if (stats.lastCompleted === puzzle) return stats
  const next: Stats = { ...stats, distribution: [...stats.distribution], played: stats.played + 1, lastCompleted: puzzle }
  if (won) {
    next.won += 1
    next.distribution[guessCount - 1] = (next.distribution[guessCount - 1] ?? 0) + 1
    next.currentStreak = stats.lastWon === puzzle - 1 ? stats.currentStreak + 1 : 1
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak)
    next.lastWon = puzzle
  } else {
    next.currentStreak = 0
  }
  return next
}

// ─── localStorage wrappers (tolerant: private mode or corrupt data → defaults) ───

const STATS_KEY = 'bytle:stats'
const DAILY_KEY = 'bytle:daily'

export interface SavedDaily {
  puzzle: number
  guesses: string[]
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or disabled: the game still works, it just won't remember.
  }
}

export function loadStats(): Stats {
  const saved = read<Partial<Stats>>(STATS_KEY)
  return saved ? { ...emptyStats(), ...saved } : emptyStats()
}

export const saveStats = (stats: Stats): void => write(STATS_KEY, stats)
export const loadDaily = (): SavedDaily | null => read<SavedDaily>(DAILY_KEY)
export const saveDaily = (daily: SavedDaily): void => write(DAILY_KEY, daily)

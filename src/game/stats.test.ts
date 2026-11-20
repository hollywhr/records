import { describe, expect, it } from 'vitest'
import { emptyStats, recordResult } from './stats'

describe('recordResult', () => {
  it('builds a streak across consecutive daily wins', () => {
    let s = emptyStats()
    s = recordResult(s, 1, true, 3)
    s = recordResult(s, 2, true, 4)
    s = recordResult(s, 3, true, 3)
    expect(s.currentStreak).toBe(3)
    expect(s.maxStreak).toBe(3)
    expect(s.distribution).toEqual([0, 0, 2, 1, 0, 0])
  })

  it('restarts the streak after a skipped day, but keeps the best streak', () => {
    let s = emptyStats()
    s = recordResult(s, 1, true, 2)
    s = recordResult(s, 2, true, 2)
    s = recordResult(s, 5, true, 2) // didn't play puzzles 3 and 4
    expect(s.currentStreak).toBe(1)
    expect(s.maxStreak).toBe(2)
  })

  it('resets the streak on a loss and counts the game as played', () => {
    let s = emptyStats()
    s = recordResult(s, 1, true, 5)
    s = recordResult(s, 2, false, 6)
    expect(s.currentStreak).toBe(0)
    expect(s.played).toBe(2)
    expect(s.won).toBe(1)
  })

  it('does not count the same puzzle twice when a finished game is reloaded', () => {
    // On page load, a finished daily game is restored and its result
    // re-announced; that must not inflate "played" or the streak.
    let s = recordResult(emptyStats(), 7, true, 4)
    s = recordResult(s, 7, true, 4)
    expect(s.played).toBe(1)
    expect(s.currentStreak).toBe(1)
  })
})

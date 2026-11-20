// These tests run with TZ=America/New_York (vite.config.ts → test.env) so the
// daylight-saving cases behave the same on every machine, including CI (UTC).
import { describe, expect, it } from 'vitest'
import { answerForPuzzle, practiceAnswer, puzzleNumber } from './daily'
import { ANSWERS } from './words'

describe('puzzleNumber', () => {
  it('is puzzle 1 all of launch day, and turns over at local midnight', () => {
    expect(puzzleNumber(new Date(2026, 10, 19, 0, 0))).toBe(1)
    expect(puzzleNumber(new Date(2026, 10, 19, 23, 59))).toBe(1)
    expect(puzzleNumber(new Date(2026, 10, 20, 0, 1))).toBe(2)
  })

  it('neither skips nor repeats a puzzle across daylight-saving changes', () => {
    // US clocks spring forward on 2027-03-14 (a 23-hour day) and fall back
    // on 2027-11-07 (a 25-hour day). Dividing raw milliseconds by 24h would
    // drift by an hour here and could land two calendar days on one puzzle.
    const days = [13, 14, 15].map((d) => puzzleNumber(new Date(2027, 2, d, 0, 30)))
    expect(days[1]! - days[0]!).toBe(1)
    expect(days[2]! - days[1]!).toBe(1)
    const fall = [6, 7, 8].map((d) => puzzleNumber(new Date(2027, 10, d, 23, 30)))
    expect(fall[1]! - fall[0]!).toBe(1)
    expect(fall[2]! - fall[1]!).toBe(1)
  })
})

describe('answerForPuzzle', () => {
  it('uses every answer exactly once before any word repeats', () => {
    const cycle = ANSWERS.map((_, i) => answerForPuzzle(i + 1))
    expect([...cycle].sort()).toEqual([...ANSWERS].sort())
    expect(answerForPuzzle(ANSWERS.length + 1)).toBe(answerForPuzzle(1))
  })

  it('keeps the published schedule stable', () => {
    // Guard rail, not a spec: every player's daily answer is derived from the
    // order of ANSWERS. If this fails, an edit to words.ts reshuffled the
    // whole schedule, including today's word for anyone mid-game. Because the
    // schedule is a shuffle of the whole list, even APPENDING a word reshuffles
    // it; growing the list needs a schedule migration (see words.ts).
    expect([1, 2, 3].map(answerForPuzzle)).toEqual(PINNED_FIRST_THREE)
  })
})

describe('practiceAnswer', () => {
  it("never hands out today's daily answer", () => {
    const today = 1
    const daily = answerForPuzzle(today)
    for (let k = 0; k < ANSWERS.length; k++) {
      const pick = practiceAnswer(today, () => k / ANSWERS.length)
      expect(pick).not.toBe(daily)
    }
  })
})

// Puzzles #1–#3 as published (2026-11-19, 2026-11-20, 2026-11-21).
const PINNED_FIRST_THREE: string[] = ['PIVOT', 'CLONE', 'TRAIT']

// Which word is today's? (ADR-0001, QST-PUZZLE-CADENCE — built provisionally
// as option C: a daily puzzle plus practice.)
//
// No server: every browser computes the same answer from the date. Day 1 is
// the launch day, 2026-11-19, and days turn over at the player's LOCAL
// midnight (like the genre's convention; the UTC-vs-local choice is still
// open in ADR-0001). The answer list is shuffled once with a fixed seed so
// the schedule is not just the list's category order.

import { ANSWERS } from './words'

const LAUNCH = { year: 2026, monthIndex: 10, day: 19 } // November is month index 10
const MS_PER_DAY = 86_400_000
const SCHEDULE_SEED = 0xb17e // "byte", roughly

/** Puzzle number for a moment in time: 1 on launch day, counting local calendar days. */
export function puzzleNumber(now: Date): number {
  // Compare calendar dates via Date.UTC of the LOCAL y/m/d, so daylight-saving
  // shifts (23- or 25-hour days) can never skip or repeat a puzzle.
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const launch = Date.UTC(LAUNCH.year, LAUNCH.monthIndex, LAUNCH.day)
  return Math.floor((today - launch) / MS_PER_DAY) + 1
}

/** Small deterministic PRNG (mulberry32): same seed, same sequence, every browser. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

const SCHEDULE = shuffled(ANSWERS, SCHEDULE_SEED)

/** The answer for a puzzle number; the schedule repeats after ANSWERS.length days. */
export function answerForPuzzle(n: number): string {
  const len = SCHEDULE.length
  return SCHEDULE[(((n - 1) % len) + len) % len]!
}

/**
 * A practice answer: any word except today's daily one.
 *
 * Deviation from the recommendation in ADR-0001 (which said "practice draws
 * only from past daily answers"): at launch there ARE no past answers, so that
 * rule would leave practice empty for weeks. Practice may therefore reveal a
 * future daily word; recorded in ADR-0001's Iteration 2.
 */
export function practiceAnswer(today: number, rand: () => number = Math.random): string {
  const todays = answerForPuzzle(today)
  const pool = ANSWERS.filter((w) => w !== todays)
  return pool[Math.floor(rand() * pool.length)]!
}

import { describe, expect, it } from 'vitest'
import { ANSWERS, isValidGuess } from './words'

describe('answer list', () => {
  it('contains only five-letter, uppercase A–Z words', () => {
    const bad = ANSWERS.filter((w) => !/^[A-Z]{5}$/.test(w))
    expect(bad).toEqual([])
  })

  it('has no duplicates (a duplicate would make that word come up twice as often)', () => {
    const dupes = ANSWERS.filter((w, i) => ANSWERS.indexOf(w) !== i)
    expect(dupes).toEqual([])
  })

  it('is large enough to last a while as a daily puzzle', () => {
    // ADR-0001 QST-WORD-LENGTH: below ~100 words, five letters is too thin.
    expect(ANSWERS.length).toBeGreaterThanOrEqual(100)
  })
})

describe('isValidGuess', () => {
  it('accepts every answer, including CS jargon missing from English dictionaries', () => {
    // MUTEX, REGEX, ASYNC and TUPLE are not in the ENABLE list (checked
    // 2026-11-19). Without merging the answers in, a player could type
    // the correct answer and be told it "is not in the word list".
    const rejected = ANSWERS.filter((w) => !isValidGuess(w))
    expect(rejected).toEqual([])
    expect(isValidGuess('MUTEX')).toBe(true)
  })

  it('accepts ordinary English words players use as openers, including plurals', () => {
    for (const w of ['CRANE', 'SLATE', 'STARS', 'audio']) expect(isValidGuess(w)).toBe(true)
  })

  it('rejects letter strings that are not words', () => {
    expect(isValidGuess('XQZVK')).toBe(false)
    expect(isValidGuess('AEIOU')).toBe(false)
  })
})

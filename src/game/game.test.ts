import { describe, expect, it } from 'vitest'
import { MAX_GUESSES, newGame, shareText, submitGuess, type GameState } from './game'
import { isValidGuess } from './words'

function play(state: GameState, ...words: string[]): GameState {
  for (const w of words) {
    const r = submitGuess(state, w, isValidGuess)
    if (!r.ok) throw new Error(`"${w}" was rejected: ${r.reason}`)
    state = r.state
  }
  return state
}

describe('submitGuess', () => {
  it('rejects a non-word without using up a try', () => {
    const game = newGame('CACHE')
    const r = submitGuess(game, 'XQZVK', isValidGuess)
    expect(r).toEqual({ ok: false, reason: 'not-a-word' })
    expect(game.guesses).toHaveLength(0)
  })

  it('rejects an incomplete guess (Enter pressed after four letters)', () => {
    expect(submitGuess(newGame('CACHE'), 'CACH', isValidGuess)).toEqual({ ok: false, reason: 'too-short' })
  })

  it('wins when the answer is guessed, even in lowercase', () => {
    const state = play(newGame('QUEUE'), 'crane', 'queue')
    expect(state.status).toBe('won')
    expect(state.guesses).toHaveLength(2)
  })

  it('loses after six wrong guesses, and the sixth guess is still scored', () => {
    const state = play(newGame('MUTEX'), 'CRANE', 'SLATE', 'AUDIO', 'PIOUS', 'STARS', 'BUMPY')
    expect(state.guesses).toHaveLength(MAX_GUESSES)
    expect(state.status).toBe('lost')
  })

  it('accepts no more guesses once the game is over', () => {
    const won = play(newGame('TOKEN'), 'TOKEN')
    expect(submitGuess(won, 'CRANE', isValidGuess)).toEqual({ ok: false, reason: 'game-over' })
  })
})

describe('shareText', () => {
  it('shares the color grid without revealing any letters', () => {
    const state = play(newGame('TOKEN'), 'OTTER', 'TOKEN')
    const text = shareText(state, 'Bytle #1')
    expect(text).toBe('Bytle #1 2/6\n\n🟨🟨⬛🟩⬛\n🟩🟩🟩🟩🟩')
    expect(text).not.toMatch(/OTTER|TOKEN/)
  })

  it('shows X/6 for a lost game', () => {
    const state = play(newGame('MUTEX'), 'CRANE', 'SLATE', 'AUDIO', 'PIOUS', 'STARS', 'BUMPY')
    expect(shareText(state, 'Bytle #1')).toMatch(/^Bytle #1 X\/6/)
  })
})

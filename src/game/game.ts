// One game's state and the rules for submitting a guess — pure functions,
// no Vue, no storage, so the rules can be tested directly.

import { scoreGuess, type LetterState } from './score'

export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

export type Status = 'playing' | 'won' | 'lost'

export interface ScoredGuess {
  word: string
  states: LetterState[]
}

export interface GameState {
  answer: string
  guesses: ScoredGuess[]
  status: Status
}

export type SubmitResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'game-over' | 'too-short' | 'not-a-word' }

export function newGame(answer: string): GameState {
  return { answer: answer.toUpperCase(), guesses: [], status: 'playing' }
}

/**
 * Try to submit a guess. A rejected guess (too short, not a word) does NOT
 * use up one of the six tries — the player just gets a message and retypes.
 */
export function submitGuess(
  state: GameState,
  rawGuess: string,
  isValidGuess: (word: string) => boolean,
): SubmitResult {
  if (state.status !== 'playing') return { ok: false, reason: 'game-over' }
  const word = rawGuess.toUpperCase()
  if (word.length !== WORD_LENGTH) return { ok: false, reason: 'too-short' }
  if (!isValidGuess(word)) return { ok: false, reason: 'not-a-word' }

  const guesses = [...state.guesses, { word, states: scoreGuess(word, state.answer) }]
  const status: Status =
    word === state.answer ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing'
  return { ok: true, state: { ...state, guesses, status } }
}

/** The shareable result grid (no letters, so it never spoils the answer). */
export function shareText(state: GameState, label: string): string {
  const score = state.status === 'won' ? String(state.guesses.length) : 'X'
  const rows = state.guesses.map((g) =>
    g.states.map((s) => (s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛')).join(''),
  )
  return `${label} ${score}/${MAX_GUESSES}\n\n${rows.join('\n')}`
}

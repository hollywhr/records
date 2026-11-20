// Scoring a guess against the answer — the heart of the game.
//
// The rule for repeated letters (ADR-0001, Explicitation): greens are marked
// first; then each remaining guess letter is yellow only while the answer
// still has an UNMATCHED copy of that letter, scanning left to right.
// Everything else is gray. Example — answer QUEUE, guess EERIE:
//   E E R I E  →  present, absent, absent, absent, correct
// QUEUE has two E's; the last E is green and uses one, the first E is yellow
// and uses the other, so the second E has nothing left to match.
//
// Written for any word length (QST-WORD-LENGTH recommendation): only the UI
// assumes five letters, so variable-length puzzles would not need a rewrite.

export type LetterState = 'correct' | 'present' | 'absent'

export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase()
  const a = answer.toUpperCase()
  if (g.length !== a.length) {
    throw new Error(`guess "${g}" and answer "${a}" differ in length`)
  }

  const result: LetterState[] = new Array<LetterState>(g.length).fill('absent')
  const unmatched = new Map<string, number>()

  // Pass 1: exact matches; count the answer letters left over.
  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct'
    } else {
      const letter = a[i]!
      unmatched.set(letter, (unmatched.get(letter) ?? 0) + 1)
    }
  }

  // Pass 2: misplaced letters, limited by the leftover counts.
  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue
    const letter = g[i]!
    const left = unmatched.get(letter) ?? 0
    if (left > 0) {
      result[i] = 'present'
      unmatched.set(letter, left - 1)
    }
  }

  return result
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }

/**
 * Fold one scored guess into the on-screen keyboard's colors. A key only
 * ever gets better (gray → yellow → green): in EERIE-vs-QUEUE the middle E
 * is gray, but the key E must stay green because another E was green.
 */
export function mergeKeyStates(
  keys: Readonly<Record<string, LetterState>>,
  guess: string,
  states: readonly LetterState[],
): Record<string, LetterState> {
  const next = { ...keys }
  const g = guess.toUpperCase()
  for (let i = 0; i < g.length; i++) {
    const letter = g[i]!
    const state = states[i]!
    const prev = next[letter]
    if (prev === undefined || RANK[state] > RANK[prev]) next[letter] = state
  }
  return next
}

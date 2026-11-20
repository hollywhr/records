import { describe, expect, it } from 'vitest'
import { mergeKeyStates, scoreGuess } from './score'

describe('scoreGuess', () => {
  it('marks every letter green when the guess is the answer', () => {
    expect(scoreGuess('STACK', 'STACK')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })

  it('marks letters missing from the answer gray', () => {
    expect(scoreGuess('BUMPY', 'CACHE')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
  })

  it('is case-insensitive (keyboard input may arrive lowercase)', () => {
    expect(scoreGuess('stack', 'STACK')).toEqual(scoreGuess('STACK', 'STACK'))
  })

  // The repeated-letter cases below are where Wordle clones usually go wrong
  // (CLAUDE.md, Fifth Directive "Why").

  it('does not give a yellow to a letter whose copies are all used up by greens', () => {
    // ARRAY has two R's, both matched green by ERROR's middle R's.
    // A naive "is the letter anywhere in the answer?" check would turn the
    // final R yellow and tell the player there is a third R.
    expect(scoreGuess('ERROR', 'ARRAY')).toEqual(['absent', 'correct', 'correct', 'absent', 'absent'])
  })

  it('gives only as many yellows as the answer has unmatched copies', () => {
    // TOKEN has one T: OTTER's first T is yellow, the second must be gray.
    expect(scoreGuess('OTTER', 'TOKEN')).toEqual(['present', 'present', 'absent', 'correct', 'absent'])
  })

  it('counts greens before yellows even when the green comes later in the word', () => {
    // QUEUE has two E's; EERIE's last E is green and claims one, the first E
    // takes the other as yellow, and the second E has nothing left to match.
    expect(scoreGuess('EERIE', 'QUEUE')).toEqual(['present', 'absent', 'absent', 'absent', 'correct'])
  })
})

describe('mergeKeyStates', () => {
  it('never downgrades a key: a letter that was green stays green', () => {
    // In EERIE vs QUEUE the middle E is gray but another E is green;
    // the on-screen E key must show green, not gray.
    const keys = mergeKeyStates({}, 'EERIE', scoreGuess('EERIE', 'QUEUE'))
    expect(keys.E).toBe('correct')
    expect(keys.R).toBe('absent')
  })

  it('upgrades a yellow key to green when a later guess places the letter', () => {
    let keys = mergeKeyStates({}, 'OTTER', scoreGuess('OTTER', 'TOKEN'))
    expect(keys.T).toBe('present')
    keys = mergeKeyStates(keys, 'TOKEN', scoreGuess('TOKEN', 'TOKEN'))
    expect(keys.T).toBe('correct')
  })
})

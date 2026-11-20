// Bytle's word lists (ADR-0001).
//
// ANSWERS — the curated computer-science words that can be the hidden word.
// Inclusion rule (first draft, open to Haoran's edits): exactly five letters
// A–Z; a term a CS student would recognize; no product or brand names
// (no LINUX, REDIS, REACT). Well-known acronyms used as words (ASCII) and
// Unix command names (CHMOD, MKDIR) are allowed.
//
// ⚠ The daily schedule is a fixed shuffle of THIS list (see daily.ts).
// ANY edit, even appending one word at the end, changes every day's answer,
// including today's, for anyone mid-game. (Tracked in docs/TECHNICAL-DEBT.md.) daily.test.ts pins the first days of
// the schedule so such an edit fails loudly instead of silently.
//
// VALID GUESSES — any 5-letter word in the public-domain ENABLE list
// (src/game/data/guesses.txt, built by scripts/ephemeral/2026-11-19-build-guess-list.sh)
// PLUS every answer: ENABLE lacks CS jargon such as MUTEX, REGEX, ASYNC, TUPLE,
// and a player must never be told the right answer "is not in the word list".

import guessText from './data/guesses.txt?raw'

export const ANSWERS: readonly string[] = [
  // data structures
  'ARRAY', 'STACK', 'QUEUE', 'DEQUE', 'GRAPH', 'TUPLE', 'TABLE', 'INDEX',
  'CHAIN', 'UNION', 'FIELD', 'VALUE', 'ENTRY', 'SLICE',
  // programming languages
  'CLASS', 'CONST', 'YIELD', 'CATCH', 'THROW', 'BREAK', 'WHILE', 'SUPER',
  'MATCH', 'SCOPE', 'ALIAS', 'MACRO', 'ARITY', 'UNARY', 'INFIX', 'TRAIT',
  'THUNK', 'MONAD', 'FLOAT', 'ASYNC', 'AWAIT', 'DEFER', 'PANIC', 'RAISE',
  'ERROR', 'FINAL', 'SHORT', 'PRINT', 'INPUT', 'LABEL', 'GUARD', 'LOCAL',
  'EAGER', 'HOIST', 'FALSE', 'REGEX', 'PARSE', 'LEXER',
  // algorithms, math, hardware
  'LOGIC', 'MERGE', 'SPLIT', 'PRIME', 'DEPTH', 'WIDTH', 'ORDER', 'RANGE',
  'BOUND', 'DELTA', 'PIVOT', 'CYCLE', 'COUNT', 'DIGIT', 'OCTAL', 'OCTET',
  'QUBIT', 'RADIX', 'CARRY', 'ADDER', 'SHIFT', 'CLOCK',
  // systems, concurrency, operations
  'CACHE', 'MUTEX', 'LATCH', 'FENCE', 'STALL', 'FAULT', 'CRASH', 'SPAWN',
  'FLUSH', 'SHELL', 'INODE', 'MOUNT', 'SLEEP', 'TIMER', 'SHARD', 'QUOTA',
  'ALLOC', 'BATCH', 'SPOOL', 'STDIN', 'CHMOD', 'CHOWN', 'MKDIR', 'STATE',
  'STORE', 'EVENT', 'WRITE', 'CHUNK', 'SCALE', 'BUILD', 'DEBUG', 'TRACE',
  // networking and security
  'PROXY', 'ROUTE', 'RELAY', 'PROBE', 'RESET', 'RETRY', 'NONCE', 'TOKEN',
  'CODEC', 'AUDIT', 'ADMIN', 'LOGIN', 'CLOUD', 'MODEM', 'VIRUS',
  // version control
  'FETCH', 'CLONE', 'STASH', 'BLAME', 'PATCH',
  // databases (SQL keywords)
  'QUERY', 'WHERE', 'LIMIT', 'GROUP', 'INNER', 'OUTER',
  // graphics, UI, AI
  'PIXEL', 'VOXEL', 'GLYPH', 'IMAGE', 'FRAME', 'ASCII', 'STYLE', 'MODAL',
  'AGENT', 'MODEL', 'LAYER', 'EPOCH', 'ALPHA', 'ROBOT',
  // software process
  'AGILE', 'SCRUM', 'SETUP',
]

const ENGLISH = guessText
  .split('\n')
  .map((w) => w.trim().toUpperCase())
  .filter((w) => w.length > 0)

const VALID_GUESSES: ReadonlySet<string> = new Set([...ENGLISH, ...ANSWERS])

export function isValidGuess(word: string): boolean {
  return VALID_GUESSES.has(word.toUpperCase())
}

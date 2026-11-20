// Connects the pure game rules (src/game/) to Vue reactivity, the browser's
// storage, and the clipboard. Components stay presentational.

import { computed, ref, shallowRef } from 'vue'
import { answerForPuzzle, practiceAnswer, puzzleNumber } from '../game/daily'
import { newGame, shareText, submitGuess, WORD_LENGTH, type GameState } from '../game/game'
import { mergeKeyStates, type LetterState } from '../game/score'
import { loadDaily, loadStats, recordResult, saveDaily, saveStats } from '../game/stats'
import { isValidGuess } from '../game/words'

export type Mode = 'daily' | 'practice'
export type Key = 'ENTER' | 'BACKSPACE' | string

export function useBytle(now: () => Date = () => new Date()) {
  const today = puzzleNumber(now())
  const mode = ref<Mode>('daily')
  const game = shallowRef<GameState>(restoreDaily())
  const current = ref('')
  const stats = ref(loadStats())
  const toast = ref<string | null>(null)
  /** Bumped on every rejected guess; the board re-mounts the row to replay the shake. */
  const shake = ref(0)

  const keyStates = computed<Record<string, LetterState>>(() =>
    game.value.guesses.reduce<Record<string, LetterState>>(
      (keys, g) => mergeKeyStates(keys, g.word, g.states),
      {},
    ),
  )

  function restoreDaily(): GameState {
    let state = newGame(answerForPuzzle(today))
    const saved = loadDaily()
    if (saved && saved.puzzle === today) {
      // Replay without re-validating: these guesses were accepted when made,
      // and a later word-list edit must not erase a player's progress.
      for (const word of saved.guesses) {
        const r = submitGuess(state, word, () => true)
        if (r.ok) state = r.state
      }
    }
    return state
  }

  let toastTimer: ReturnType<typeof setTimeout> | undefined
  function showToast(message: string, ms = 1800): void {
    toast.value = message
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = null), ms)
  }

  function submit(): void {
    const r = submitGuess(game.value, current.value, isValidGuess)
    if (!r.ok) {
      if (r.reason === 'game-over') return
      showToast(r.reason === 'too-short' ? 'Not enough letters' : 'Not in word list')
      shake.value++
      return
    }
    game.value = r.state
    current.value = ''
    if (mode.value === 'daily') {
      saveDaily({ puzzle: today, guesses: r.state.guesses.map((g) => g.word) })
      if (r.state.status !== 'playing') {
        stats.value = recordResult(stats.value, today, r.state.status === 'won', r.state.guesses.length)
        saveStats(stats.value)
      }
    }
  }

  function press(key: Key): void {
    if (game.value.status !== 'playing') return
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') current.value = current.value.slice(0, -1)
    else if (/^[A-Z]$/.test(key) && current.value.length < WORD_LENGTH) current.value += key
  }

  function setMode(next: Mode): void {
    if (next === mode.value && next === 'daily') return
    mode.value = next
    current.value = ''
    game.value = next === 'daily' ? restoreDaily() : newGame(practiceAnswer(today))
  }

  async function share(): Promise<void> {
    const label = mode.value === 'daily' ? `Bytle #${today}` : 'Bytle (practice)'
    const text = shareText(game.value, label)
    try {
      await navigator.clipboard.writeText(text)
      showToast('Result copied to clipboard')
    } catch {
      showToast('Could not copy; your browser blocked the clipboard')
    }
  }

  return { today, mode, game, current, stats, toast, shake, keyStates, press, setMode, share }
}

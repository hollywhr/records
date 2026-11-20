<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MAX_GUESSES, WORD_LENGTH, type ScoredGuess } from '../game/game'
import type { LetterState } from '../game/score'

const props = defineProps<{
  guesses: ScoredGuess[]
  current: string
  /** Increments on each rejected guess. */
  shake: number
}>()

type TileState = LetterState | 'typed' | 'empty'
interface Tile {
  letter: string
  state: TileState
}
interface Row {
  key: string
  tiles: Tile[]
  revealed: boolean
  active: boolean
}

const LABEL: Record<TileState, string> = {
  correct: 'correct',
  present: 'in the word, wrong spot',
  absent: 'not in the word',
  typed: 'typed',
  empty: 'empty',
}

const rows = computed<Row[]>(() =>
  Array.from({ length: MAX_GUESSES }, (_, r): Row => {
    const g = props.guesses[r]
    if (g) {
      // A distinct key from the typing row makes Vue mount a fresh row on
      // submit, which plays the flip animation exactly once.
      return {
        key: `guess-${r}`,
        revealed: true,
        active: false,
        tiles: [...g.word].map((letter, i) => ({ letter, state: g.states[i]! })),
      }
    }
    const active = r === props.guesses.length
    return {
      key: `row-${r}`,
      revealed: false,
      active,
      tiles: Array.from({ length: WORD_LENGTH }, (_, i): Tile => {
        const letter = active ? (props.current[i] ?? '') : ''
        return { letter, state: letter ? 'typed' : 'empty' }
      }),
    }
  }),
)

// Shake the typing row briefly when a guess is rejected.
const shaking = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.shake,
  () => {
    shaking.value = false
    clearTimeout(timer)
    requestAnimationFrame(() => {
      shaking.value = true
      timer = setTimeout(() => (shaking.value = false), 450)
    })
  },
)
</script>

<template>
  <div class="board" role="group" aria-label="Guesses">
    <div
      v-for="row in rows"
      :key="row.key"
      class="row"
      :class="{ revealed: row.revealed, shaking: row.active && shaking }"
    >
      <div
        v-for="(tile, i) in row.tiles"
        :key="i"
        class="tile"
        :class="tile.state"
        :style="{ '--i': i }"
        :aria-label="tile.letter ? `${tile.letter}, ${LABEL[tile.state]}` : 'empty'"
      >
        {{ tile.letter }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  gap: 6px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.tile {
  width: min(3.6rem, 15vw);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 2px solid var(--border);
  border-radius: 4px;
  font-size: min(1.9rem, 8vw);
  font-weight: 700;
  line-height: 1;
  user-select: none;
}

.typed {
  border-color: var(--border-strong);
  animation: pop 90ms ease-out;
}

.correct {
  --tile-bg: var(--correct);
}
.present {
  --tile-bg: var(--present);
}
.absent {
  --tile-bg: var(--absent);
}

.revealed .tile {
  background: var(--tile-bg);
  border-color: var(--tile-bg);
  animation: flip 480ms ease both;
  animation-delay: calc(var(--i) * 110ms);
}

.shaking {
  animation: shake 420ms ease;
}

@keyframes pop {
  50% {
    transform: scale(1.08);
  }
}

/* The color switches at the midpoint, while the tile is edge-on. */
@keyframes flip {
  0% {
    transform: scaleY(1);
    background: transparent;
    border-color: var(--border-strong);
  }
  50% {
    transform: scaleY(0);
    background: transparent;
    border-color: var(--border-strong);
  }
  51% {
    background: var(--tile-bg);
    border-color: var(--tile-bg);
  }
  100% {
    transform: scaleY(1);
    background: var(--tile-bg);
    border-color: var(--tile-bg);
  }
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-6px);
  }
  40%,
  80% {
    transform: translateX(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .typed,
  .revealed .tile,
  .shaking {
    animation: none;
  }
}
</style>

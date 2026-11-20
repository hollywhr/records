<script setup lang="ts">
import type { LetterState } from '../game/score'

defineProps<{ keyStates: Record<string, LetterState> }>()
const emit = defineEmits<{ key: [key: string] }>()

const ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]
</script>

<template>
  <div class="keyboard" aria-label="Keyboard">
    <div v-for="(row, r) in ROWS" :key="r" class="row">
      <button
        v-for="k in row"
        :key="k"
        type="button"
        class="key"
        :class="[keyStates[k], { wide: k.length > 1 }]"
        :aria-label="k === 'BACKSPACE' ? 'Delete letter' : k === 'ENTER' ? 'Submit guess' : k"
        @click="emit('key', k)"
      >
        {{ k === 'BACKSPACE' ? '⌫' : k === 'ENTER' ? 'enter' : k }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
}

.row {
  display: flex;
  gap: 6px;
}

.row:nth-child(2) {
  padding: 0 5%;
}

.key {
  flex: 1;
  height: 3.4rem;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: var(--key);
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 200ms;
}

.key:active {
  filter: brightness(1.2);
}

.wide {
  flex: 1.5;
  font-size: 0.8rem;
}

.correct {
  background: var(--correct);
}
.present {
  background: var(--present);
}
.absent {
  background: var(--absent);
  color: var(--muted);
}
</style>

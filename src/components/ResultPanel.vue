<script setup lang="ts">
import { computed } from 'vue'
import type { Stats } from '../game/stats'

const props = defineProps<{
  status: 'won' | 'lost'
  answer: string
  guessCount: number
  mode: 'daily' | 'practice'
  stats: Stats
}>()
const emit = defineEmits<{ share: []; next: [] }>()

const winRate = computed(() =>
  props.stats.played === 0 ? 0 : Math.round((100 * props.stats.won) / props.stats.played),
)
</script>

<template>
  <section class="result" role="status" aria-live="polite">
    <p v-if="status === 'won'" class="headline">
      <span class="ok">✓</span> solved in {{ guessCount }}/6
    </p>
    <p v-else class="headline">
      the word was <strong>{{ answer }}</strong>
    </p>

    <dl v-if="mode === 'daily'" class="stats">
      <div><dt>played</dt><dd>{{ stats.played }}</dd></div>
      <div><dt>win %</dt><dd>{{ winRate }}</dd></div>
      <div><dt>streak</dt><dd>{{ stats.currentStreak }}</dd></div>
      <div><dt>best</dt><dd>{{ stats.maxStreak }}</dd></div>
    </dl>
    <p v-if="mode === 'daily'" class="hint">a new word every day at midnight</p>

    <div class="actions">
      <button type="button" class="primary" @click="emit('share')">share</button>
      <button type="button" @click="emit('next')">
        {{ mode === 'daily' ? 'practice' : 'next word' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.result {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  text-align: center;
  width: 100%;
}

.headline {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.ok {
  color: var(--accent);
}

strong {
  color: var(--accent);
  letter-spacing: 0.1em;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 0 0 0.5rem;
}

.stats div {
  display: flex;
  flex-direction: column-reverse;
}

dt {
  font-size: 0.7rem;
  color: var(--muted);
}

dd {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.hint {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

button {
  padding: 0.5rem 1.2rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.primary {
  border-color: var(--correct);
  background: var(--correct);
  font-weight: 700;
}
</style>

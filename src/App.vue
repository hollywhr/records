<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import GameBoard from './components/GameBoard.vue'
import GameKeyboard from './components/GameKeyboard.vue'
import ResultPanel from './components/ResultPanel.vue'
import ToastMessage from './components/ToastMessage.vue'
import { useBytle } from './composables/useBytle'

const bytle = useBytle()
const { today, mode, game, current, stats, toast, shake, keyStates } = bytle

function onKeydown(e: KeyboardEvent): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'Enter') bytle.press('ENTER')
  else if (e.key === 'Backspace') bytle.press('BACKSPACE')
  else if (/^[a-zA-Z]$/.test(e.key)) bytle.press(e.key.toUpperCase())
  else return
  // Also stops Enter from "clicking" whichever button has focus.
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app">
    <header class="top">
      <h1 class="title">bytle<span class="caret" aria-hidden="true">_</span></h1>
      <nav class="modes" aria-label="Game mode">
        <button
          type="button"
          :class="{ active: mode === 'daily' }"
          :aria-pressed="mode === 'daily'"
          @click="bytle.setMode('daily')"
        >
          daily #{{ today }}
        </button>
        <button
          type="button"
          :class="{ active: mode === 'practice' }"
          :aria-pressed="mode === 'practice'"
          @click="bytle.setMode('practice')"
        >
          practice
        </button>
      </nav>
    </header>

    <main class="play">
      <p class="tagline">guess the computer-science word in six tries</p>
      <GameBoard :guesses="game.guesses" :current="current" :shake="shake" />
      <ResultPanel
        v-if="game.status !== 'playing'"
        :status="game.status"
        :answer="game.answer"
        :guess-count="game.guesses.length"
        :mode="mode"
        :stats="stats"
        @share="bytle.share()"
        @next="bytle.setMode('practice')"
      />
    </main>

    <GameKeyboard :key-states="keyStates" @key="bytle.press" />

    <footer class="foot">
      <a href="https://github.com/hollywhr/records" target="_blank" rel="noopener">source</a>
      ·
      <a href="https://github.com/hollywhr/records/tree/main/docs/adr" target="_blank" rel="noopener"
        >how it was decided</a
      >
    </footer>

    <ToastMessage :message="toast" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.title {
  margin: 0;
  font-size: 1.6rem;
  letter-spacing: 0.05em;
  color: var(--accent);
}

.caret {
  animation: blink 1.1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.modes {
  display: flex;
  gap: 0.25rem;
}

.modes button {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.modes button.active {
  border-color: var(--accent);
  color: var(--text);
}

.play {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0 1rem;
}

.tagline {
  margin: 0 0 1rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.foot {
  margin-top: 0.75rem;
  font-size: 0.7rem;
  color: var(--muted);
}

.foot a {
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>

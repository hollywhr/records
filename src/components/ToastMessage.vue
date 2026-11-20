<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

<template>
  <Transition name="toast">
    <div v-if="message" class="toast" role="alert">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  background: var(--text);
  color: var(--bg);
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 10;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>

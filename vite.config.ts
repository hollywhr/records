import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves a project site under /<repo-name>/, so the built
// asset URLs must carry that prefix or the page loads blank. The deploy
// workflow sets BASE_PATH from the repository name (ADR-0002), which keeps
// a future repo rename from silently breaking the site; locally it is "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue()],
  test: {
    include: ['src/**/*.test.ts'],
    // Fixed time zone so the daylight-saving tests in daily.test.ts mean the
    // same thing on a laptop in Philadelphia and on a UTC CI runner.
    env: { TZ: 'America/New_York' },
  },
})

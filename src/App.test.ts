// @vitest-environment happy-dom
//
// End-to-end through the real components: a player types on their physical
// keyboard, submits, gets rejected for a non-word, wins, then reloads the page.
// This exercises the wiring the unit tests can't: keydown handling, the
// composable, localStorage persistence, and what the player actually sees.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from './App.vue'
import { answerForPuzzle } from './game/daily'

async function type(word: string): Promise<void> {
  for (const key of [...word, 'Enter']) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    await nextTick()
  }
}

function rowLabels(wrapper: VueWrapper, row: number): string[] {
  return wrapper
    .findAll('.row')
    [row]!.findAll('.tile')
    .map((t) => t.attributes('aria-label')!)
}

describe('playing the daily puzzle', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 19, 12, 0)) // launch day → puzzle #1
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
  })

  it('scores guesses, rejects non-words, records the win, and survives a reload', async () => {
    const answer = answerForPuzzle(1)
    wrapper = mount(App, { attachTo: document.body })
    expect(wrapper.text()).toContain('daily #1')

    // A real word is scored and shown letter by letter.
    await type('CRANE')
    expect(rowLabels(wrapper, 0)[0]).toMatch(/^C, /)
    expect(wrapper.findAll('.row')[0]!.classes()).toContain('revealed')

    // A non-word is refused and does not use up a row.
    await type('XQZVK')
    expect(wrapper.text()).toContain('Not in word list')
    expect(wrapper.findAll('.row.revealed')).toHaveLength(1)
    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
    }
    await nextTick()

    // The right answer wins in two.
    await type(answer)
    expect(wrapper.text()).toContain('solved in 2/6')
    expect(wrapper.find('.stats').text()).toContain('played1')

    // Reloading restores the finished game without counting it twice.
    wrapper.unmount()
    wrapper = mount(App, { attachTo: document.body })
    await nextTick()
    expect(wrapper.findAll('.row.revealed')).toHaveLength(2)
    expect(wrapper.text()).toContain('solved in 2/6')
    expect(wrapper.find('.stats').text()).toContain('played1')
  })
})

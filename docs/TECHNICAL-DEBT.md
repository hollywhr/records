# Technical Debt

Known compromises, recorded so they don't pile up unnoticed (see CLAUDE.md, "Technical Debt Tracking").

---

## TD-001: Editing the answer list reshuffles every daily puzzle

- **Issue**: The daily schedule is a fixed-seed shuffle of the *whole* `ANSWERS` array. Any edit, even appending one word, produces a different shuffle, so every day's answer changes. That includes today's answer for a player who is mid-game, and past puzzle numbers stop matching what was shared.
- **Location**: `src/game/daily.ts` (`SCHEDULE = shuffled(ANSWERS, SCHEDULE_SEED)`), `src/game/words.ts` (`ANSWERS`).
- **Impact**: None today, since the list hasn't changed since launch. It will bite the first time someone curates the list (ADR-0001 follow-up: inclusion rule).
- **Workaround**: `daily.test.ts` pins puzzles #1–#3, so an edit fails the gate loudly instead of silently changing the live schedule.
- **Fix**: Freeze the shuffled order as an explicit, append-only schedule, e.g. `schedule.ts` exporting the already-shuffled list. New words go at the end and are used only after the current cycle; removed words are swapped for a replacement on future days only.
- **Priority**: Medium. Do it before the first edit to the word list.
- **Logged**: 2026-11-19, Lexeme 5.5 (Claude Opus 5.5)

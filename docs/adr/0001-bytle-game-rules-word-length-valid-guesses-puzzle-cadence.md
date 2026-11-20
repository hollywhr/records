<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# ADR-0001: Bytle game rules: word length, valid guesses, puzzle cadence

- **Date**: 2026-11-19
- **Iteration**: 2
- **Status**: Partially Implemented
- **Deciders**: Haoran Wang (human), Lexeme 5.5 (Claude Opus 5.5)

**TL;DR**: Before any code: settle how long answers are (QST-WORD-LENGTH) and which guesses count as valid (QST-GUESS-VALIDITY). These two choices fix the grid, the word lists, and the scoring engine's contract. Whether the game is daily or unlimited is also asked here, but deferred, because it changes only how the answer is picked.

---

## Originating Context

**Source**: Human dump (below), first session, 2026-11-19.

> The project is a Wordle variant — guess the word, colored feedback per letter — with a twist: the answers are computer science words (ARRAY, STACK, QUEUE, CACHE, TOKEN…). I want it hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local. Before you write any code: what are the 2–3 decisions we should settle first? Put them to me as proper QST cards in the record — with your recommendation on each.

The hosting and build half of that dump is a separate topic, covered in [ADR-0002](0002-where-bytles-code-lives-and-how-it-reaches-github-pages.md).

**Agency Grant**: Explore options and recommend; no code until these are answered.

---

## Explicitation

**What I understand**:

1. **The "CS" twist is in the answers.** The core loop (guess, then get green/yellow/gray per letter) stays the familiar one. Everything below is about where the CS theme ends: is it only in the answers, or does it also reach word length and the guesses a player is allowed to type?
2. **Word length and guess validity have to be settled before code.** They set the grid size, which word lists we must find and ship, and what the scoring function receives. Changing either one after the UI exists means rework.
3. **Daily vs. unlimited can wait.** It changes only how the answer is chosen, so the engine and the grid can be built first.

**Assumptions** (say so if any is wrong; none of them is posed as a question):

- **Scoring follows the standard rule for repeated letters.** Mark greens first. Then mark yellows from left to right, limited by how many copies of each letter the answer still has unmatched. Example: answer `QUEUE`, guess `EERIE`. Only two letters can be yellow or green as `E`s, so the extra `E` is gray. This is the most common bug in Wordle clones, so it gets tests from day one.
- **Six guesses**, like the original.
- **Every answer is shown in uppercase and contains only the letters A–Z.** No digits or punctuation, so `IPV6` and `C++` are out.
- **The answer list ships inside the JavaScript bundle**, so anyone who reads the source can see it. For a free static site with no server, that's acceptable.

**Confirm**: Haoran, through the answers below.

---

## Questions

### QST-WORD-LENGTH: How long are Bytle's answers: always five letters, or different each puzzle?
- Status: unanswered — built provisionally on Recommendation A after Haoran's go-ahead "继续做，我要网站" (2026-11-19); still Haoran's to confirm or override
- Why asking: The grid width, the on-screen keyboard behavior, the word lists we need, and how many CS words are even available all depend on this. Five letters lets in ARRAY, STACK, QUEUE, CACHE, TOKEN, MUTEX, QUERY, PARSE, REGEX, TUPLE… but rules out KERNEL, LAMBDA, SOCKET, POINTER, BINARY, RECURSION, and any 4-letter word (HASH, NODE, BYTE, LOOP).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Always five**: Every answer has exactly 5 letters, on a fixed 6×5 grid like the original. The answer pool is limited to 5-letter CS words, which I estimate at roughly 150–250 recognizable ones (not yet counted).
- **B — Varies by puzzle**: Each puzzle's answer is 4–9 letters, and the grid resizes to fit (the length is visible from the start). This opens up the biggest part of CS vocabulary (KERNEL, LAMBDA, POINTER, RECURSION). The cost: the grid, the keyboard, and guess checking must all handle any length, and we need valid-guess lists for every length.
- **C — Player chooses**: Separate 5-, 6-, and 7-letter modes, each with its own pool and stats. This is the most vocabulary and the most work: three lists to curate, plus menus and per-mode stats.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-19)

**A — Always five.** *Rationale*: All five example words in the brief (ARRAY, STACK, QUEUE, CACHE, TOKEN) have five letters, so the brief already assumes this length. A fixed grid keeps the first version small. Choosing A also doesn't lock us in: I'll write the scoring engine to accept any length (`score(guess, answer)` never hard-codes 5) and keep 5 only in the UI. Moving to B later would then be a UI change, not a rewrite. *Confidence*: 0.75 — because the examples point clearly to five letters, but my 150–250 pool estimate is a guess I haven't checked against a real list. *If wrong*: if the curated 5-letter list comes out under about 100 words that a CS student would recognize, the pool is too thin to stay fresh, and this flips to **B**.

**ANS:** (by Haoran Wang)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-GUESS-VALIDITY: Which guesses does Bytle accept: any English word, only CS words, or any five letters?
- Status: unanswered — built provisionally on Recommendation A after Haoran's go-ahead (2026-11-19); still Haoran's to confirm or override
- Why asking: The answers are always CS words, but guesses are how the player collects letter information, so this decides what the game feels like. It also decides which word list we must find, license, and ship. One catch: standard English dictionaries leave out much CS jargon (MUTEX, REGEX, ASYNC), so any dictionary option has to include the answer list too, or a player could be told the correct answer "is not a word."
- Need: pick a letter (or override — any shape answers)

Options:
- **A — English plus CS**: A guess is valid if it's in a freely licensed English word list (for example ENABLE, which is public domain, with several thousand 5-letter words) **or** in the CS answer list. Anything else is rejected with a "not in word list" shake. Familiar openers like CRANE and SLATE work, and the bundle grows by roughly 20 KB gzipped.
- **B — CS words only**: Only CS terms are accepted (the answer list, possibly plus a larger CS vocabulary). Every guess teaches or tests a term, so it's closer to a CS quiz. But with only a few hundred candidates, the possible answers narrow quickly, and a player who can't think of another CS word that fits gets stuck.
- **C — Any five letters**: No word list at all: any letter string is accepted. It's the least code and the smallest download. But players can type made-up strings like `AEIOU` to test letters, which makes the game much easier.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-19)

**A — English plus CS.** *Rationale*: The CS theme is in the answers. Guesses are just how the player gathers clues, and anyone who has played the original will expect their usual starting word to work. With B, a pool of about 200 answers drops to a handful of candidates after two guesses, so the game is about recalling vocabulary more than reasoning about letters. With C, made-up probe words remove the challenge. Including the answer list inside the valid-guess list is mandatory, and it gets its own test: "every answer is accepted as a guess." *Confidence*: 0.8 — because this is how the genre usually works and the trade-offs are clear, but I haven't yet confirmed the license and contents of a specific English list. *If wrong*: if you want Bytle to teach, so that even guesses make the player think in CS terms (for a class or study group, say), that's a different game and this flips to **B**.

**ANS:** (by Haoran Wang)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending the two answers above. This section gets filled in at Iteration 2.*

---

## Open Follow-ups

### QST-PUZZLE-CADENCE: Daily puzzle, unlimited play, or both?
- Status: deferred — built provisionally as C with one change: practice draws from all answers except today's, not only from past ones (Iteration 2 explains why); revisit now that a playable build exists
- Why asking: In **daily** mode, every player gets the same answer on a given calendar day, computed in the browser from the date, so no server is needed. Daily mode also allows streaks and a shareable emoji grid. In **unlimited** mode, each game draws a random answer. Two catches. With about 200 answers, daily-only lasts about 200 days before repeating. And an unlimited mode drawing from the same pool can reveal future daily answers.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Daily only**: One puzzle per day, picked deterministically from the date, with streaks and stats saved in the browser (`localStorage`). This is the genre's usual format. Testing it means waiting a day or faking the clock.
- **B — Unlimited only**: A "New game" button picks a random answer. Easy to replay and test, but no shared daily puzzle and no streaks.
- **C — Daily, plus practice**: Daily is the main mode. A practice mode draws only from answers that have **already been** daily puzzles, so it never spoils a future day. Both modes share the engine; only the answer-picking function differs.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-19)

**C — Daily, plus practice.** *Rationale*: The two modes differ in one function, `pickAnswer(mode, date)`. Practice mode also doubles as the test harness while we build: without it, you could play your own game once a day. Limiting practice to past answers removes the spoiler problem. *Confidence*: 0.65 — because I'm confident about the architecture, but whether a puzzle day starts at local midnight or UTC midnight is still open, and that choice is yours. *If wrong*: if it turns out you won't use practice mode once the game is built, drop to **A**.

**ANS:** (by Haoran Wang)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

- [ ] Concern: **curating the answer list is real work and needs judgment.** Some 5-letter CS words are obscure (`STDIN`?), some are proper nouns (`LINUX`, `NGINX`, `REDIS`), and some are abbreviations (`ASCII`, `CRLF`). We'll need an inclusion rule. I'll propose one when I draft the list.
- [ ] Future task: colorblind-friendly mode (high-contrast colors in place of green/yellow), plus keyboard and screen-reader access for the grid.
- [ ] Future task: "hard mode" (any letter revealed as green or yellow must be used in later guesses). It's cheap once the engine exists.

---

## Action Items

- [ ] Answer QST-WORD-LENGTH and QST-GUESS-VALIDITY - Owner: Haoran Wang
- [ ] After the answers: draft the answer list along with its inclusion rule, and pick an English word list with a license we can use - Owner: Lexeme 5.5

---

## Iterations

### Iteration 1 (2026-11-19)
- Trigger: Initial draft from the human dump (first session)
- Contributors: Haoran Wang (dump), Lexeme 5.5 / Claude Opus 5.5 (structure, options, recommendations)
- Changes: Created; two questions open, one deferred
- Outcome: `Draft`

### Iteration 2 (2026-11-19)
- Trigger: Haoran's go-ahead "继续做，我要网站" ("keep going, I want the website") with all three questions still open
- Contributors: Lexeme 5.5 / Claude Opus 5.5
- Changes:
  - **Built v0.1 on the recommendations**: QST-WORD-LENGTH A, QST-GUESS-VALIDITY A, QST-PUZZLE-CADENCE C. The questions stay open; each Status line says it was built provisionally.
  - **Answer list drafted**: `src/game/words.ts` holds 150+ words under a first inclusion rule: five letters A–Z, recognizable to a CS student, no brand names, and well-known acronyms or Unix commands allowed. Haoran should review it. The "below ~100 words" falsifier on QST-WORD-LENGTH did not trigger.
  - **Guess list**: ENABLE's 8,636 five-letter words (public domain), with the answers merged in. This confirmed the assumption: `MUTEX`, `REGEX`, `ASYNC` and `TUPLE` are **not** in ENABLE, and a test now guards the merge.
  - **Walking back part of my own recommendation on QST-PUZZLE-CADENCE.** I had recommended that practice draw only from past daily answers, so it could never spoil a future day. At launch there are no past answers, so practice would have been empty for weeks. As built, practice draws from every answer except today's, which means it **can** reveal a future daily word. Haoran's call whether that's acceptable.
  - **Day boundary**: local midnight, with launch day 2026-11-19 as puzzle #1. Whether a day should start at local midnight or UTC midnight is still open.
  - **New debt**: editing the answer list reshuffles the whole daily schedule. Logged as TD-001 in `docs/TECHNICAL-DEBT.md`, and a pinned-schedule test makes it fail loudly.
- Outcome: `Draft → Partially Implemented`

---

## Glossary (optional)

- **Answer pool**: the curated list of CS words that can be the hidden answer.
- **Valid-guess list**: the words a player may submit as guesses. Per QST-GUESS-VALIDITY, it always includes the answer pool.
- **Bytle**: the project's name (byte + the "-dle" ending used by guessing games). It keeps "Wordle", a New York Times trademark, out of the title.

---

## Links

- Related ADRs: [ADR-0002 — where the code lives and how it is deployed](0002-where-bytles-code-lives-and-how-it-reaches-github-pages.md)

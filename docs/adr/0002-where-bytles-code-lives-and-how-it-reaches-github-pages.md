<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# ADR-0002: Where Bytle's code lives and how it reaches GitHub Pages

- **Date**: 2026-11-19
- **Iteration**: 1
- **Status**: Partially Implemented
- **Deciders**: Haoran Wang (human), Lexeme 5.5 (Claude Opus 5.5)

**TL;DR**: Scoped CSS means Bytle needs a build step. So the code lives in this repo next to the records, Vite builds it, and a GitHub Actions workflow tests, builds, and deploys it to Pages on every push to `main`. This was built provisionally on the recommendation, after Haoran said to go ahead ("继续做，我要网站") with the question still unanswered.

---

## Originating Context

**Source**: Human dump, quoted in [ADR-0001](0001-bytle-game-rules-word-length-valid-guesses-puzzle-cadence.md#originating-context): *"I want it hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local."* Then a go-ahead on 2026-11-19: *"继续做，我要网站"* ("keep going, I want the website").

**Agency Grant**: Build it. The go-ahead came before the question below was answered, so what's built follows the recommendation and can be changed.

---

## Explicitation

**What I understand**:

1. **Scoped CSS rules out the no-build options.** `<style scoped>` only works inside `.vue` single-file components, and those must be compiled first (here by `@vitejs/plugin-vue` under Vite). Loading Vue from a CDN with no build step cannot give component-scoped styles. So GitHub Pages has to serve *built* files, which raises two questions: where is the build done, and where does the code live?
2. **Free Pages requires a public repo.** `hollywhr/records` is public (checked with `gh repo view`, 2026-11-19), so the free tier works here.
3. **The site's URL path follows the repo name.** A project site is served at `https://hollywhr.github.io/records/`, so the build must set Vite's `base` to `/records/`, or the page loads with no styles or scripts. I set it from the repo name during the CI build instead of hard-coding it, so renaming the repo cannot silently break the site.

**Assumptions** (conventional defaults I picked, not posed as questions; say so to change any):

- **TypeScript.** The scoring engine is the part most likely to have bugs, and types catch mistakes when guesses and feedback arrays get passed around.
- **Vitest** for tests, because it uses the same config as Vite.
- **Node LTS in CI.** Local development runs whatever Node asdf or Homebrew provides (26.x as of today).

**Confirm**: Haoran.

---

## Questions

### QST-CODE-HOME: Where does Bytle's code live, and how does the built site reach GitHub Pages?
- Status: unanswered — built provisionally on Recommendation A after Haoran's go-ahead (2026-11-19); still Haoran's to confirm or override
- Why asking: Scoped CSS means Bytle needs a build step, so Pages must serve compiled output. There are two linked choices: whether the code lives with the records in `hollywhr/records` or in its own repo, and whether the build runs in GitHub's CI or on your machine. One trap: GitHub Pages can publish a repo's `/docs` folder, but this repo's `/docs` holds the records, so that option would publish the ADRs instead of the game.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Here, CI deploys**: The Vite app sits at this repo's root (`src/`, `package.json`) next to `docs/adr/`. A GitHub Actions workflow runs the tests and build on every push to `main` and deploys `dist/` to Pages. URL: `hollywhr.github.io/records/` (it changes if the repo is renamed, say to `bytle`). Built files never get committed.
- **B — Own repo, CI deploys**: A new `hollywhr/bytle` repo holds the code with the same Actions setup, and this repo keeps only the records. The URL is cleaner (`/bytle/`), but every decision lives one repo away from the code it governs, and each session has to work across two repos.
- **C — Here, build by hand**: Build locally and commit the output to a `gh-pages` branch. No CI to set up, but compiled files end up in git, and nothing stops a stale or untested build from going live.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-19)

**A — Here, CI deploys.** *Rationale*: The template's own layout in CLAUDE.md (File Structure: `src/`, `tests/` next to `docs/`) expects code and records together. Keeping them together means an ADR and the code it governs change in the same commit. The Actions deploy path (`build_type=workflow`) is GitHub's supported way to publish a site that needs a build, and `gh auth status` shows the `workflow` permission it requires is already granted. Running tests in that workflow before deploying puts the Fifth Directive's gate in front of the live site. *Confidence*: 0.8 — because every fact above was checked today, but whether you mind `records` appearing in the URL is a matter of taste I can't check. *If wrong*: if you want the records private while the game stays public (free Pages needs a public repo), this flips to **B**, or to A plus the ADRs4AI `no-adrs-mirror` Action.

**ANS:** (by Haoran Wang)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Context
Bytle must be built before it can be served, it must be free to host, and it must stay next to its records.

### Chosen: A — Here, CI deploys (provisional, pending QST-CODE-HOME)

**Rationale**: See the recommendation above.

**Trade-offs accepted**: The URL includes `records` until the repo is renamed. Deploying depends on GitHub Actions.

### Consequences
- `.github/workflows/deploy.yml` runs `npm ci`, then `npm test`, then `npm run build` (type check plus Vite build), then deploys to Pages. If any step fails, nothing is deployed.
- `just gate` now runs `npm test` and `npm run build` in the slot the template reserved for project checks.
- Pages has to be switched on once with "Source: GitHub Actions" (`gh api -X POST repos/hollywhr/records/pages -f build_type=workflow`).

---

## Open Follow-ups

- [ ] Future task: rename the repo to `bytle` for a cleaner URL (`base` follows the repo name automatically). GitHub redirects git operations from the old name, but not the old Pages URL.

---

## Iterations

### Iteration 1 (2026-11-19)
- Trigger: Initial draft from the human dump, then the go-ahead "继续做，我要网站"
- Contributors: Haoran Wang (dump and go-ahead), Lexeme 5.5 / Claude Opus 5.5 (structure, recommendation, build)
- Changes: Created. Option A built provisionally while the question stays open.
- Outcome: `Partially Implemented`

---

## Links

- Related ADRs: [ADR-0001 — game rules](0001-bytle-game-rules-word-length-valid-guesses-puzzle-cadence.md)
- Related code: `vite.config.ts`, `.github/workflows/deploy.yml`, `justfile` (the `gate` recipe)

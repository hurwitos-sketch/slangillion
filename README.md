# Slangillion

A mobile-first daily slang game built with Next.js App Router, strict TypeScript, React, Tailwind CSS, and original CSS/SVG artwork. No accounts, paid APIs, or backend required.

## Run

Use Node.js 22.13+ (validated with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: `npm run build` then `npm start`.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

The browser suite starts a dedicated production server on port 3100, so build first. It refuses to reuse a running server, preventing tests from silently checking an old build. It tests desktop and iPhone-sized Chromium using `/usr/bin/chromium`. To use Playwright-managed browsers on another machine, remove `executablePath` in `playwright.config.ts` and run `npx playwright install chromium`. The iPhone project checks mobile layout and touch emulation in Chromium; it does not test Safari or a physical device.

## Rules and persistence

Seven unique prompts are selected deterministically from the ISO UTC date with a seeded shuffle. The challenge number counts from January 1, 2026. Each round starts with an absolute 25-second deadline; refreshes and background tabs do not reset it. Recognized answers lock once and reveal before the next timer starts. Unrecognized submissions stay on the same prompt, preserve the editable input, and show an inline error; retries never reset the deadline or change the score. Midnight UTC opens the new daily challenge. Completed results and unfinished games are stored per day in localStorage. Empty answers prompt correction; timed-out answers earn zero. Recognition checks canonical forms, explicit aliases, safe spelling variants, then conservative unambiguous typo corrections. Matching remains question-specific and preserves negation such as “no cap.”

`lib/data.ts` preserves all 15 original categories and their daily-selection order. `lib/slang-bank.ts` expands only Attractive, Poor, Lying, Angry, Partying, Laughing, and Talking: **367 canonical expressions and 419 explicit aliases (786 registered inputs)**, plus normalization and safe typo patterns. Other category vocabularies are unchanged. See [the complete inventory and tier-by-tier review](docs/slang-answer-audit.md), generated with `npm run docs:slang`.

Scores for the seven reviewed categories are **provisional editorial estimates** of expressiveness, cultural relevance, specificity, and quality—not measured player frequencies. The existing tier names, colors, and values are retained; ordinary synonyms and obscure idioms do not automatically receive high scores. Regional expressions are equally valid. Review status describes this MVP curation, not independent linguistic verification. The bank is intentionally finite: rejection does not establish that an expression is fake slang. Some entries contain adult language. “Trim,” “fraud,” and “silly” are deliberately rejected for their respective requested prompts because the intended meanings are ambiguous or do not match.

The optional feedback button records an unmatched attempt on the current device under `slangillion:feedback`; no server or review queue receives it. `lib/legacy-data.ts` freezes the previous bank so old saved scores and completions can be restored without rescoring. Newly evaluated rounds record recognition version 2; unfinished old games can use new recognition on subsequent rounds.

`lib/game.ts` owns deterministic selection, scoring, state transitions, saved-state validation, and spoiler-free sharing independently of React. `lib/normalization.ts` and `lib/recognition.ts` implement the centralized answer pipeline. `components/Game.tsx` handles browser storage and the game UI; `components/Environment.tsx` contains the five original illustrated environments. Native sharing is used when available, with clipboard and selectable-text fallbacks. Cancellation leaves the share sheet closed without copying. Tabs reconcile saved progress before actions and ignore delayed events that would rewind a round. No player rankings or measured frequencies are invented.

localStorage is not anti-cheat protection: clearing storage, modifying the clock/state, or using another device can bypass daily limits. Private browsing, storage restrictions, and device changes affect persistence. A production competitive game needs server-side dates, scoring, and progress. There is no analytics or remote collection.

## Deploy on Vercel

1. Commit these project files and push the repository to GitHub.
2. Import the repository in Vercel and select the **Next.js** preset. Use the repository root as the root directory.
3. Use a supported Node.js version (24 recommended), `npm ci` for installation, and `npm run build` for the build. Keep the default Next.js output settings.
4. Deploy. No environment variables, database, or secrets are needed. Sharing uses the deployed page's origin automatically.

Before wider launch, expand and independently review the regional answer bank, check accessibility with assistive technology, and test on real Safari/iPhone and Android devices. Leaderboards, accounts, practice, analytics, multiplayer, and player-frequency scoring are deliberately outside this MVP.

The requested reference site could not be accessed in the build environment (network policy returned HTTP 403); implementation follows the supplied specification and uses original visuals.

## Character selection and welcome screen

The welcome screen offers eight cosmetic characters: COURIER, MC, PATHFINDER, TAG, KICKFLIP, DJ, REMIX, and ECHO. Portraits, full-body characters, and the empty lift are separate local WebP assets. The selected ID is validated and stored independently under `slangillion:character:v1`; new or invalid preferences default to COURIER. No account or runtime image-generation service is involved.

The welcome action becomes **RESUME DAILY** for an unfinished saved challenge or **VIEW RESULTS** after completion. Existing absolute deadlines continue on the welcome screen and inside the character dialog; selecting a character never starts a new round or modifies daily progress. During gameplay, use the small avatar in the header to change characters. The selected character appears in gameplay, reveals, and results.

[Implementation notes, asset provenance, changed files, and screenshots](docs/character-selection.md).

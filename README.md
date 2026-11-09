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

`lib/data.ts` preserves the original 15-category order and daily selection. `lib/slang-bank.ts` now curates every category together, with 26–38 canonical expressions per prompt rather than a few small banks next to much larger ones. The bank focuses on slang, figurative idioms, and familiar forms of address. Ordinary Attractive synonyms such as hot, cute, beautiful, and handsome, and Money → cash, are removed. Requested friend, money, and appearance slang is included with context notes. See [the generated full inventory](docs/slang-answer-audit.md), refreshed with `npm run docs:slang`.

Scores remain provisional editorial estimates. The four live tiers are Street Level (20), Subway (50), Trenches (85), and The Underground (100); Caves is removed. Each prompt has exactly one canonical Underground answer, including its accepted spelling variants and aliases. The seven-round maximum remains 700. They are not measured player frequencies, and regional origin is not a reason to award more points. The data records source status: a small community dictionary supports four checked definitions; the remaining entries are explicitly pending independent web review. Dictionary/search access is currently blocked by the environment's restricted network policy. [The source log](docs/slang-research-log.md) records actual requests, inspected sources, the access blocker, and context-dependent inclusions. Do not describe the full bank as internet-verified.

The optional feedback button records unmatched attempts only on the current device. `lib/legacy-data.ts` preserves initial saved scores; `lib/slang-bank-v2.ts`, `lib/data-v2.ts`, and `lib/recognition-v2.ts` freeze the prior answer system. The corresponding `-v3` bank/data/matcher files preserve the previous five-tier system. Newly evaluated rounds record recognition version 4. Historical scores stay unchanged; old Caves results display in Subway, old Trenches in Trenches, and old Underground in the final level. Existing completions and earned scores remain valid even if a formerly accepted answer is removed or rescored.

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

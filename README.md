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

The browser suite starts the production server, so build first. It tests desktop and iPhone-sized Chromium using `/usr/bin/chromium`. To use Playwright-managed browsers on another machine, remove `executablePath` in `playwright.config.ts` and run `npx playwright install chromium`. The iPhone project checks mobile layout and touch emulation in Chromium; it does not test Safari or a physical device.

## Rules and persistence

Seven unique prompts are selected deterministically from the ISO UTC date with a seeded shuffle. The challenge number counts from January 1, 2026. Each round starts with an absolute 25-second deadline; refreshes and background tabs do not reset it. Answers lock once and reveal before the next timer starts. Midnight UTC opens the new daily challenge. Completed results and unfinished games are stored per day in localStorage. Empty answers prompt correction; timed-out answers earn zero. Answers match only the curated bank after case, whitespace, apostrophe, and punctuation normalization.

`lib/data.ts` contains 15 categories and editable canonical answers, aliases, associated prompt IDs, five rarity tiers, point values, explanations, and editorial review status. All rarity assignments are **provisional editorial estimates**, not measured player frequencies. Regional expressions are equally valid when accepted. Editorial review status describes this MVP curation, not independent linguistic verification. The bank is intentionally finite: a rejected expression may still be genuine slang. The feedback button records it only on the current device under `slangillion:feedback`; there is no server or review queue receiving it. Some expressions contain adult language.

`lib/game.ts` owns normalization, deterministic selection, scoring, state transitions, saved-state validation, and spoiler-free sharing independently of React. `components/Game.tsx` handles browser storage and the game UI; `components/Environment.tsx` contains the five original illustrated environments. Native sharing is used when available, with clipboard and selectable-text fallbacks. No player rankings or measured frequencies are invented.

localStorage is not anti-cheat protection: clearing storage, modifying the clock/state, or using another device can bypass daily limits. Private browsing, storage restrictions, and device changes affect persistence. A production competitive game needs server-side dates, scoring, and progress. There is no analytics or remote collection.

## Deploy on Vercel

1. Commit these project files and push the repository to GitHub.
2. Import the repository in Vercel and select the **Next.js** preset. Use the repository root as the root directory.
3. Use a supported Node.js version (24 recommended), `npm ci` for installation, and `npm run build` for the build. Keep the default Next.js output settings.
4. Deploy. No environment variables, database, or secrets are needed. Sharing uses the deployed page's origin automatically.

Before wider launch, expand and independently review the regional answer bank, check accessibility with assistive technology, and test on real Safari/iPhone and Android devices. Leaderboards, accounts, practice, analytics, multiplayer, and player-frequency scoring are deliberately outside this MVP.

The requested reference site could not be accessed in the build environment (network policy returned HTTP 403); implementation follows the supplied specification and uses original visuals.

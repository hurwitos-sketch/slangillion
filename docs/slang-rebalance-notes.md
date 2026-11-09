# All-category slang rebalance

## Result

The current bank has 513 canonical expressions and 505 explicit aliases (1,018 registered inputs across prompts). All 15 categories now have 26–38 canonical expressions, instead of small original banks beside seven much larger banks. Category array order, seeded daily selection, UI, characters, round deadlines, invalid retries, and sharing are unchanged.

Requested recognized forms include:

- Friend: dawg, jit, fella, guy, bro, brah, fam, ace, homeslice. Guy maps to my guy; brah maps to bro.
- Money: racks, scratch, millis, bands, bag, motion.
- Attractive: fine shit / fine shyt, baddie, dime, talent, eye candy, dollface.

Removed current inputs include Money → cash and Attractive → hot/hottie/hot af, cute/cutie, sexy, gorgeous, stunning, pretty, beautiful, handsome, good looking. Other ordinary synonyms such as annoyed, irritated, talk/talking, awesome, brag, and boast were also removed. Familiar forms of address specifically requested by the user, such as fella/guy, are intentional exceptions to a strict slang-only interpretation.

Jit, motion, and talent have explicit intended-sense notes; they are not universal synonyms for friend, cash, or attractiveness in every context. Separate canonical expressions keep separate scores; aliases and spelling variants inherit one score. There are answers at all five scoring tiers in every category. Point assignments are editorial, not player frequencies, dictionary rankings, or an automatic premium for regional unfamiliarity.

## Preservation of old results

New results record `recognitionVersion: 3`. Frozen `lib/slang-bank-v2.ts`, `lib/data-v2.ts`, and `lib/recognition-v2.ts` preserve the previous bank and matching behavior for version-2 saved rounds. The original unmarked/version-1 results continue to use `lib/legacy-data.ts`. Thus previously accepted cash or hot results keep their earned scores without being reaccepted for new rounds. Completed daily games are not restarted.

## Research status: not finished

The user requested internet research of all slang. This requirement remains incomplete. Direct dictionary access returned an explicit proxy HTTP 403. The running environment allows package-manager/GitHub destinations, not the requested dictionary/search sites. An environment draft requesting the needed domains is saved, but it does not apply access until the user reviews/saves/publishes it in environment settings.

GitHub repository search and raw source retrieval worked. Only four entries have an inspected explicit community definition. The other 509 carry `pending-web-review` status. AI-definition frontends and entry-name-only datasets were inspected but not treated as evidence. No claim is made that the whole inventory has been verified online. [The research log](slang-research-log.md) records the actual sources and blocker. [The full current inventory](slang-answer-audit.md) lists every canonical entry, alias, score, intended sense, and source status.

## Verification

- Lint: passed.
- Strict TypeScript: passed.
- Logic tests: 25 passed, including all registered canonical/alias matches, requested additions and removals, every category's tier availability, invalid retry invariants, original saved games, and version-2 saved-score preservation.
- Production build: passed.
- Browser checks: 60 passed on desktop and iPhone-sized Chromium. They use a freshly built production server on port 3100. The suite covers character selection and existing daily-game behavior, with added Friend/Money/Attractive tests for generic rejection followed by requested slang recognition.

Desktop/mobile browser projects use Chromium and iPhone-sized Chromium emulation, not real Safari/iOS devices. Vercel deployment is not independently verified in this task.

## Modified or added files

- `README.md`
- `lib/slang-bank.ts`
- `lib/recognition.ts`
- `lib/game.ts`
- `lib/slang-bank-v2.ts`
- `lib/data-v2.ts`
- `lib/recognition-v2.ts`
- `scripts/generate-slang-report.ts`
- `docs/slang-answer-audit.md`
- `docs/slang-research-log.md`
- `docs/slang-rebalance-notes.md`
- `tests/game.test.ts`
- `tests/recognition.test.ts`
- `tests/rebalance.test.ts`
- `tests/browser/rebalance.spec.ts`

Environment draft: dictionary/search domain allowlist additions only. No credentials or secret values are required or saved.

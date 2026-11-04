# Slang answer overhaul: verification and changed files

## Verified behavior

- `npm run lint`: passed without warnings.
- `npm run typecheck`: passed with strict TypeScript.
- `npm test`: 18 tests passed, including a sweep of all 786 registered canonical/alias inputs with uppercase, whitespace, and punctuation variants.
- `npm run build`: production build passed.
- `npm run test:browser`: all 40 checks passed across desktop and iPhone-sized Chromium.
- `npm run docs:slang`: regenerated the database inventory: 367 canonical expressions, 419 explicit aliases, 786 distinct normalized registered inputs across the seven reviewed prompts.
- `git diff --check`: passed.

For every reviewed prompt, browser tests enter three rejected answers, verify that the same editable input remains, verify that the progress markup, score, stored question index, results, and deadline remain unchanged, then enter a valid typo or alias and submit twice. Exactly one canonical result is stored. The inline error clears on edits. A separate timed test confirms retries cannot extend the countdown and expiration awards zero once. The existing full-game, refresh, sharing, multiple-tab, midnight, storage-failure, responsive-width, reduced-motion, and keyboard-focus checks also pass.

The initial browser run used an overly broad alert selector that also matched Next.js's hidden route announcer. The selector was corrected to query the game's main region; the complete rerun above passed.

These checks use Chromium desktop and mobile emulation, not physical iOS/Android devices or Safari. A deployed Vercel URL was not supplied or tested in this task. The linguistic inventory and scores are editorial judgments, not independent linguistic certification or player-frequency statistics. The curated bank can still reject legitimate expressions not registered in it.

## Scope and compatibility

Only the vocabularies of Attractive, Poor, Lying, Angry, Partying, Laughing, and Talking were expanded. The existing 15-category array order and seeded daily selection remain unchanged. CSS, layout, navigation, illustrations, tier names/colors/values, and animations were not redesigned. The gameplay change is the requested editable retry on unrecognized submissions; recognized submissions retain the original reveal and Next Round flow. The inline error and local feedback control use existing styling. The gameplay hint now says “ONE LOCKED ANSWER. KEEP DIGGING.” to avoid implying that a rejected attempt consumes a round.

Legacy saved results are checked against a frozen copy of the previous bank. Their original scores, completed status, and deadlines are retained, including older zero-point rejected rounds. Subsequent rounds can use current recognition. Modern recognized results record recognition version 2. Storage keys stay unchanged so returning players' data can be found.

See [the complete inventory](slang-answer-audit.md) for per-question counts, every canonical answer organized by tier, every explicit alias, duplicate-family consolidation, conservative autocorrect rules, and meaning-review exclusions.

## All modified or added files

| File                                | Change                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md`                         | Current recognition, retry, scoring, inventory, and compatibility documentation.                                                                 |
| `components/Game.tsx`               | Editable inline retry error; error clearing and accessible input association; local feedback on rejected attempts; canonical answers in results. |
| `lib/data.ts`                       | Integrates the reviewed bank without changing category order or other vocabularies.                                                              |
| `lib/game.ts`                       | Rejects unmatched submissions without a state transition; validates legacy and modern round scores separately.                                   |
| `lib/legacy-data.ts`                | Frozen pre-overhaul bank for existing saved-game compatibility.                                                                                  |
| `lib/normalization.ts`              | Shared normalization that preserves negation, word boundaries, and supported laughter emoji.                                                     |
| `lib/recognition.ts`                | Question-specific canonical, alias, spelling, and conservative unambiguous typo matching.                                                        |
| `lib/slang-bank.ts`                 | 367 canonical entries, 419 explicit aliases, editorial score reviews, and meaning notes.                                                         |
| `package.json`                      | Adds the repeatable `docs:slang` inventory command.                                                                                              |
| `scripts/generate-slang-report.ts`  | Generates counts and the complete tier-by-tier canonical/alias inventory.                                                                        |
| `docs/slang-answer-audit.md`        | Generated full inventory, matching rules, scoring, deduplication, and exclusions.                                                                |
| `docs/slang-overhaul-notes.md`      | This verification record and complete changed-file list.                                                                                         |
| `tests/recognition.test.ts`         | Exhaustive registered-input checks, requested cases, false-positive rejection, retry invariants, and save compatibility.                         |
| `tests/browser/game.spec.ts`        | Updates the full-game flow to retry a rejected answer before locking a valid answer.                                                             |
| `tests/browser/recognition.spec.ts` | Seven-category desktop/mobile invalid retry, canonical autocorrect, repeated submission, and timeout checks.                                     |

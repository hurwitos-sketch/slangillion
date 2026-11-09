# Four-tier scoring

| Level           | Points |
| --------------- | -----: |
| Street Level    |     20 |
| Subway          |     50 |
| Trenches        |     85 |
| The Underground |    100 |

Caves is removed from live scoring, environment selection, result labels, distributions, and share grids. The seven-round maximum remains 700; invalid attempts earn nothing and remain editable until the existing deadline expires.

Exactly one **canonical expression** per prompt receives The Underground. This means one accepted answer family, not necessarily one literal token: its spelling variants and registered aliases also earn 100. All other recognized answers score 20, 50, or 85. The choices are explicit editorial selections, never random or inferred from player frequencies.

| Prompt       | Underground answer               |
| ------------ | -------------------------------- |
| Money        | dead presidents                  |
| Friend       | ride or die                      |
| Attractive   | face card never declines         |
| Leaving      | pull a houdini                   |
| Lying        | selling dreams                   |
| Excellent    | different gravy                  |
| Angry        | crash out                        |
| Tired        | cream crackered                  |
| Rich         | laughing all the way to the bank |
| Poor         | financially cooked               |
| Partying     | getting crunk                    |
| Laughing     | omegalul                         |
| Talking      | spill the tea                    |
| Showing off  | humblebrag                       |
| Embarrassing | walk of shame                    |

The central live tier definitions are in `lib/tiers.ts`; the chosen final answers are in `UNDERGROUND_ANSWERS` in `lib/slang-bank.ts`. Previous source classifications are combined into four live levels: the original common group becomes Street Level, the two middle groups become Subway, and the remaining non-champion answers become Trenches. Exactly the named champion becomes The Underground. The [generated full answer inventory](slang-answer-audit.md) contains every new assignment and retained source-review status.

## Saved-game compatibility

New rounds use recognition version 4. The frozen `lib/slang-bank-v3.ts`, `lib/data-v3.ts`, and `lib/recognition-v3.ts` preserve the previous five-tier system for version-3 saves; existing version-2 and original saves retain their own frozen validators. Earned scores, daily completion, and deadlines are not recalculated or reset.

For display, old Caves results map to Subway, old Trenches to Trenches, and old Underground to the fourth/final level. Their original earned point values remain visible. `resultTier` centralizes this translation so old tier-5 results cannot index beyond the four-element live tier list. Results distributions and sharing use four live levels; the current 100-point rule does not retroactively revoke historical awards.

## Verification

Passed: 29 logic tests, 64 desktop/mobile Chromium browser checks, lint, strict TypeScript, and the production build. Physical-device Safari and the deployed Vercel site were not tested in this task.

Logic checks cover exact level names and values, one champion per category, alias scoring, four visible legacy mappings, v3 saved-score restoration, all existing v2/original save checks, complete games, and maximum 700 scoring. Browser checks exercise all four new reveal scores, four-level result distributions, a complete old five-tier save without a rendering error, and the existing character/recognition/timer/share regressions.

Only scores and tier presentation changed. Question selection, slang vocabulary, answer matching, retry behavior, characters, and the 25-second timer are unchanged. Independent web verification of the vocabulary remains pending as documented in the [source log](slang-research-log.md); this scoring change does not claim new linguistic research.

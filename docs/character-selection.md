# Welcome screen and character integration

The approved welcome design is implemented as responsive React components with live text and controls, a separate empty lift background, alpha-transparent full-body sprites, and separate portrait assets. The page is not a flattened screenshot.

## Characters and preference

The stable IDs, displayed names, outfit descriptions, and local asset paths are centralized in `lib/characters.ts`. Display order is COURIER, MC, PATHFINDER, TAG, KICKFLIP, DJ, REMIX, ECHO. All eight are freely available and cosmetic. Native grouped radio inputs provide keyboard arrow selection, checked state, and a visible focus ring. A border and checkmark mark the selected card, in addition to its color.

The validated preference is saved independently under `slangillion:character:v1`. The default is COURIER. Invalid IDs are replaced by the default. Restricted storage leaves character selection and the game usable for the current visit with a warning when a choice cannot be saved.

## Daily game behavior

The welcome screen is shown on arrival, including on refresh. It offers PLAY DAILY for a new challenge, RESUME DAILY for an unfinished challenge, or VIEW RESULTS for completed games. Existing round deadlines continue while the welcome screen is visible. Choosing a different character or viewing results never resets the challenge. Game controls are rendered immediately on start; a brief decorative entry animation does not block interaction.

A compact header avatar opens the native character dialog. The dialog traps focus, supports Escape and a close button, focuses the selected option, and explains that the timer keeps running. Absolute game deadlines are unchanged; expiration can happen while the dialog remains open. Input drafts survive opening, selection, and closing. The active character appears beside gameplay, inside the existing rarity environment, and on the results screen.

Slang data, canonicalization, scoring, question selection, seven-round logic, UTC reset, sharing, and saved-game validation are unchanged.

## Artwork and motion

Original source concept images remain intact in `/workspace/generated_images`. Image generation produced a transparent roster adaptation and a separate empty lift scene from the approved references. The true-alpha sprite sheet was exported into eight cells and eight portrait crops using Sharp, preserving alpha rather than color-keying a background. Outputs use pre-optimized WebP, totaling approximately 760 KiB including portraits and lift. Only the active full-body image is mounted/preloaded; portraits use small separate files. Explicit image dimensions reserve layout space.

Reference files retained outside the checkout:

- Approved roster: `exec-76dcfdd7-72b2-433e-9415-6b7b8b6f47dd.png`.
- Approved welcome: `exec-e7466b05-2ae9-4420-9176-8dd2abc8e4b1.png`.
- Transparent roster adaptation: `exec-46daa598-61d3-42d0-aacb-f35ea283022a.png`.
- Empty lift artwork: `exec-14bd5a50-1a39-4e83-a588-0ab50110b9ed.png`.

The generated adaptations closely follow the approved identities and outfits; painted details can vary slightly from the source concept. DJ's curls are contained inside her hood. Logo and interface typography are live styled text, not a pixel-identical reproduction of the hand-lettered concept. Idle, preview, lift lighting, and entry motion use lightweight CSS transforms/opacity, not frame-by-frame or skeletal character animation. Reduced-motion preferences disable these effects. The full five-level descent is outside this change.

## Screenshots

- [Desktop welcome](screenshots/welcome-desktop.png)
- [Mobile welcome](screenshots/welcome-mobile.png)
- [Mobile gameplay](screenshots/gameplay-mobile.png)

## Verification

Passed: **20 logic tests and 54 browser checks**, with no lint or TypeScript errors and a successful production build.

Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser`. Browser checks launch a fresh production server on port 3100, never reusing the visual-inspection server. Tests cover all character choices, preview/name updates, persistence, invalid IDs, blocked storage, keyboard selection, modal focus/Escape, starting/resuming/completion, unchanged drafts/progress/scores/deadlines, expiration inside the selector, invalid-answer retries, mobile widths, reduced motion, and the existing daily-game regression suite.

Screenshots come from a real Chromium production render. Browser projects use desktop and iPhone-sized Chromium emulation; physical phones and Safari were not tested. The live Vercel deployment is not independently verified here.

## Modified and added files

- `README.md`
- `app/globals.css`
- `components/Game.tsx`
- `components/Welcome.tsx`
- `components/CharacterArt.tsx`
- `components/CharacterPicker.tsx`
- `components/CharacterDialog.tsx`
- `lib/characters.ts`
- `tests/characters.test.ts`
- `tests/browser/characters.spec.ts`
- `tests/browser/game.spec.ts`
- `tests/browser/recognition.spec.ts`
- `docs/character-selection.md`
- `docs/screenshots/welcome-desktop.png`
- `docs/screenshots/welcome-mobile.png`
- `docs/screenshots/gameplay-mobile.png`
- `public/art/characters/courier-portrait.webp`
- `public/art/characters/courier.webp`
- `public/art/characters/dj-portrait.webp`
- `public/art/characters/dj.webp`
- `public/art/characters/echo-portrait.webp`
- `public/art/characters/echo.webp`
- `public/art/characters/kickflip-portrait.webp`
- `public/art/characters/kickflip.webp`
- `public/art/characters/mc-portrait.webp`
- `public/art/characters/mc.webp`
- `public/art/characters/pathfinder-portrait.webp`
- `public/art/characters/pathfinder.webp`
- `public/art/characters/remix-portrait.webp`
- `public/art/characters/remix.webp`
- `public/art/characters/tag-portrait.webp`
- `public/art/characters/tag.webp`
- `public/art/lift.webp`

# Digging and descent

Recognized results travel from the unscored city through connected layers: **Subway 20 → Caves 50 → Trenches 85 → The Underground 100**. Numeric answer assignments, aliases, the single canonical 100-point answer per prompt, and the 700-point daily maximum are unchanged. City stairs connect to the station; shovel frames and debris open bare caves; another break and feet-first fall reach ore-rich mining trenches. Only a 100-point result enters the violet/cyan portal and emerges beside the neon music venue.

Each reveal starts at the city. Durations are 1.10, 2.05, 3.05, and 3.95 seconds, excluding asset loading. The locked answer, points, and destination remain outside the moving scene. Next Round appears at arrival; keyboard-accessible Skip Animation lands immediately and focuses Next Round. Neither animation nor skipping advances a round. No audio plays.

## State and rendering

- `lib/game.ts` retains scoring and persistence. `lib/tiers.ts` names destinations. Historical five-tier results map their IDs to the current presentation while retaining original points; current version-4 IDs keep their assignments.
- `lib/descent.ts` supplies pure timed action sequences, sprite frames, staircase waypoints, camera movement, and portal interpolation. Walking and digging cycle distinct poses; breaking, falling, landing, portal entry, and arrival have separate poses.
- `components/descent/Descent.tsx` owns cosmetic elapsed time, asset preload/failure, skip, reduced motion, character continuity, and cleanup. `World.tsx`, `ActionSprite.tsx`, and `Portal.tsx` render separate SVG world layers, alpha sprites, foreground floors, cracks, dirt, landing dust, ore glints, and portals.
- `components/Game.tsx` saves the locked result first, then starts the cosmetic sequence from its stored tier. Completion changes only local animation state. Existing scoring, absolute answer deadlines, deterministic selection, matching, storage reconciliation, daily rollover, and explicit Next Round transitions remain authoritative.

Refresh restores the saved result at its final destination without replay or another award. Invalid attempts and timeouts have no successful descent. Changing characters keeps the original actor until arrival, with a visible explanatory note, then applies the new appearance. Reduced motion bypasses travel and stops portal breathing. Asset errors or a 1.8-second loading timeout finish safely with the original static illustration and an explanatory status; Next Round remains usable.

## Artwork

The approved cutaway and roster guided separately generated environment plates and 12-pose transparent sheets for all eight existing characters. DJ's curls stay inside her hood. The original source images are preserved in `/workspace/generated_images`; the optimized delivery assets and their source filenames are listed in `public/art/descent/manifest.json`. Original preexisting artwork is unchanged.

`scripts/build-descent-assets.mjs [source-directory]` uses Sharp to extract, align feet, preserve alpha, and export four-column/three-row 768×576 WebP atlases with 192-pixel cells. It rejects sheets without substantial genuine transparency; no color-key background removal is used. Plates are 1200×750 WebP. Thirteen delivery images total approximately 2.2 MiB. No runtime generation service or animation library is required.

The runtime reserves an 800×500 aspect ratio, caps scene updates around 30 fps, uses 14 dirt particles, preloads local assets, and cleans up animation frames, load timers, and media listeners. The city and subway plates share the staircase; caves contain no glowing ore, while trenches contain mineral deposits and mining structures. The portal and foreground/effects are separate rendered elements.

## Evidence

- [Desktop screenshot](screenshots/descent-desktop.png)
- [Mobile screenshot](screenshots/descent-mobile.png)
- [Actual browser recording: complete Underground descent](recordings/underground-descent.mp4)

The recording is a real Chromium session against the production build, captured through Playwright with system FFmpeg and encoded as H.264 MP4. Screenshots show the final result; they do not establish motion. Browser tests observe action/frame changes during real playback for every selectable character.

Validation completed on 2026-11-09:

- ESLint and strict TypeScript checks pass.
- 34 logic tests pass, including choreography, frames, bounded camera/portal values, atlas presence/transparency metadata, and existing recognition, persistence, historical scoring, and tier invariants.
- Production Next.js build passes.
- 100 browser tests pass against that build across desktop and phone-sized Chromium. All eight actors traverse walking, digging, breaking, falling, landing, portal, and arrival; tests also check every destination, distinct walking/digging frames, skip, single award, refresh, character change, reduced motion, asset failure, invalid/timeout, explicit advancement, daily rollover, historical saves, results, sharing, and mobile layout.

## Limits

These are low-frame illustrated sprites, with some pose-to-pose drawing variation, rather than a hand-rigged production character animation. The source art guides the style but is not a pixel-exact recreation. The recording demonstrates Courier; automated action/frame playback checks cover all eight. Chromium desktop and mobile emulation were tested; real iPhone Safari, Android hardware, screen-reader behavior, and sustained low-end-device performance have not been measured. Loading on a slow connection may intentionally use the static fallback. Original high-resolution source PNGs remain in the workspace rather than being bundled into the deployed application; rebuilding assets elsewhere requires those source files.

## Modified files

- `components/Game.tsx`, `Environment.tsx`, and `app/globals.css`: integration, fallback destinations, stage/controls/motion styles.
- `components/descent/{Descent,World,ActionSprite,Portal}.tsx`: animation lifecycle and rendering.
- `lib/descent.ts`, `lib/tiers.ts`, `lib/game.ts`: choreography, destination names, historical presentation, sharing colors.
- `public/art/descent/`: five plates, eight action atlases, provenance manifest.
- `scripts/build-descent-assets.mjs`: reproducible asset preparation from preserved sources.
- `tests/descent.test.ts`, `tests/tiers.test.ts`, `tests/browser/{descent,characters,game,tiers}.spec.ts`: new coverage and updated expectations.
- `README.md`, `scripts/generate-slang-report.ts`, `docs/slang-answer-audit.md`: current destination documentation and regenerated inventory.
- This document, `docs/screenshots/descent-{desktop,mobile}.png`, and `docs/recordings/underground-descent.mp4`: delivery notes and review artifacts.

# Answer station redesign

The answer screen now sits inside the illustrated subway world: a destination sign presents the prompt, the selected character idles beside it, and a worn metal terminal contains real HTML typing controls. Seven connected transit stops indicate progress. A compact station clock shows exact remaining seconds and a diminishing gauge, switching to warm amber during the final five seconds without flashing. Score remains secondary.

The input uses warm off-white text, a visible label, the “Drop your slang…” placeholder, and a cyan focus outline. The illuminated LOCK IT IN button has distinct hover, focus, and pressed states; desktop users see an Enter hint. Invalid answers retain editable text and focus, with calm inline feedback. Existing correction feedback, accepted-answer display, and descent are retained; a brief cyan confirmation accent introduces the descent.

No game rules, recognition, answer assignments, storage, timing, or score logic changed. The same submission handler locks once and the existing save-before-descent flow remains authoritative. Character changes and invalid retries preserve the absolute deadline. Controls remain outside the moving descent scene. There is no audio or new dependency.

The scene reuses `public/art/descent/subway.webp` and the existing separate character artwork. The destination sign, frame, screws, countdown gauge, and input are independent HTML/CSS elements. Text and controls are not baked into an image. Reserved dimensions avoid image layout shifts.

On phones, the layout condenses the sign and character and omits the desktop keyboard hint. A short-viewport layout reduces scenery when screen space is limited. Input text remains at least 18px, and submit targets exceed 44px. No new focus or scrolling handlers run while typing. Reduced motion disables the character idle and confirmation accent.

## Review images

- [Desktop answer screen](screenshots/answer-station-desktop.png)
- [Mobile answer screen](screenshots/answer-station-mobile.png)

Screenshots use the production build, a fixed daily date, and paused decorative animations for a sharp capture.

## Changed files

- `components/Game.tsx`: presentation markup, visible input label, station timer, terminal and prompt sign; existing handlers retained.
- `app/globals.css`: station surfaces, responsive composition, input/button feedback, transit progress and reduced motion.
- `tests/browser/characters.spec.ts`: character artwork selectors updated for the new layout.
- `tests/browser/station.spec.ts`: deadline/focus/score preservation through invalid retries and keyboard submission; compact viewport typing, target sizing, no horizontal overflow, and reduced motion.
- This document, README link, and two review screenshots.

## Limitations

Mobile checks use Chromium emulation and a reduced viewport to approximate keyboard space. Native iOS/Android software-keyboard behavior and Safari still need physical-device checks. On exceptionally short viewports, normal page scrolling remains available rather than hiding controls or blocking keyboard behavior. Existing illustrated character assets retain their original resolution.

## Validation

On 2026-11-09, ESLint, strict TypeScript, the production Next.js build, and all 34 logic tests passed. All 104 desktop/mobile Chromium browser tests passed against that build, including the new station checks and existing character, recognition/autocorrect, timer, storage, rollover, scoring, sharing, and descent coverage. Formatting-only changes followed the build; lint and TypeScript were rerun successfully.

Typography follow-up: the UI now shares the Arial/Helvetica sans-serif family used by the FRIEND prompt, replacing monospace labels and alternate display families. Labels, timer digits, and hints use a consistent bold weight; the prompt retains its existing lettering. Updated screenshots were checked. Lint, TypeScript, production build, and eight targeted desktop/mobile layout and station browser tests passed.

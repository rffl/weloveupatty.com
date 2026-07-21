# Always-Physical Scrapbook Page Turn Design

## Purpose

Patty should always receive the complete physical scrapbook page-turn experience. A device-level `prefers-reduced-motion` setting must not replace the finger-tracked sheet, 3D rotation, paper faces, shadows, gutter depth, or normal settlement timing with a simplified fade.

This is a narrow motion-policy change. It does not remove the structural accessibility and interaction safeguards that keep the scrapbook reliable for its intended reader.

## Approved behavior

- Every page turn uses the same direct, two-sided physical sheet in normal and device reduced-motion modes.
- Dragging continues to track the pointer continuously.
- Committed and cancelled turns retain the approved physical settlement durations and easing.
- Rapid buffered navigation, final-page snap-back, retained-cover behavior, and resize interruption remain unchanged.
- The experience does not expose a page-turn-specific reduced-motion state or alternate visual branch.

## Page-turn architecture

Remove reduced-motion state from the page-turn pipeline rather than forcing a permanent `false` value through dead branches:

- delete the page-turn-only `useReducedMotion` hook because it has no consumer outside this pipeline;
- remove `reducedMotion` from `Scrapbook` → `usePageTurner` and `Scrapbook` → `PageTurner` props;
- remove the reduced-duration constant and option from `settleDurationMs`;
- remove the reduced-motion destination-fade/cancel branches from `PageTurner`;
- remove the `data-reduced-motion` attribute and page-turn-specific CSS selectors;
- keep interaction-context cancellation for responsive-mode changes, but no longer model a reduced-motion context change.

The normal Task 1–4 motion path becomes the sole page-turn implementation. This reduces lifecycle branches while guaranteeing the intended physical result.

## Safeguards retained

The following behavior remains because it prevents real interaction defects and does not dilute the visual design:

- transient source, destination, stationary, front, and back copies remain `inert` and `aria-hidden`;
- the landed page remains the only semantic and focusable page;
- note/dialog focus restoration, Escape handling, and interactive-target gesture guards remain;
- keyboard, button, edge-tap, and swipe navigation remain;
- landed-page progress remains the only announcement; drag progress is not live-announced;
- pinch zoom remains allowed, with no restrictive viewport metadata or `touch-action: none`;
- the reading view retains internal scrolling;
- one-leaf, latest-pending-direction, boundary, and stale-callback protections remain.

## Unrelated reduced motion

The existing site-level `@media (prefers-reduced-motion: reduce)` behavior for the cover and unrelated decorative CSS motion remains unchanged. The exception applies only to physical scrapbook page turns, which are driven by the JavaScript/Web Animations API scene.

## Verification

No unit tests or test infrastructure will be added or run.

Verification will use:

- the existing Node 22.12 TypeScript/Vite production build;
- source checks confirming no page-turn `reducedMotion`, `data-reduced-motion`, reduced-duration, or destination-fade branch remains;
- source checks confirming inert/hidden visual copies, focus/dialog guards, keyboard navigation, pinch zoom, and reading-view scrolling remain;
- desktop and mobile browser checks for direct drag, commit, cancel, buffered input, boundaries, and resize behavior;
- a reduced-motion device/emulation check, when genuinely available, confirming page turns use the same 3D transforms and timing as normal mode.

Any unavailable real-device or emulated-media check will be reported as unverified rather than inferred.

## Out of scope

- removing general accessibility semantics;
- removing keyboard or dialog behavior;
- disabling pinch zoom;
- changing content, layouts, artwork, photos, notes, or recipes;
- changing the cover's reduced-motion treatment;
- changing page-turn thresholds, edge bands, durations, easing, or physical styling;
- adding dependencies or tests.

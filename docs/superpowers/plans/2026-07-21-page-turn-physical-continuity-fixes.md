# Page-Turn Physical Continuity Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the desktop turn artifacts, leave a physically parked previous sheet over the mobile cover, make that sheet pullable backward, align mobile rotation with finger position, and hard-stop forward interaction at the final page.

**Architecture:** Keep the existing `idle -> dragging -> settling` state machine and transient two-sided leaf. Add one idle-only mobile history leaf behind the current page, extend its gesture hit area over the retained cover, and change only mobile drag progress to inverse projected-edge geometry. Correct desktop lighting by removing descendant-sensitive filtering and duplicate transient divider layers rather than rebuilding the 3D scene.

**Tech Stack:** React 19, TypeScript 6, Vite 6, native Pointer Events, requestAnimationFrame, Web Animations API, handcrafted CSS, npm under Node 22.12.0.

---

## Guardrails and file map

Read the approved specification first:

- `docs/superpowers/specs/2026-07-21-page-turn-physical-continuity-fixes-design.md`

The user explicitly requested one connected implementation pass and one review only after all implementation is complete. Do not split this work into separately reviewed subtasks.

The user explicitly prohibited unit tests. Do not add or run unit tests, add a test runner, create snapshots, or add a `test` script. Use the production build, exact source checks, and genuine browser checks.

Files changed by this plan:

- Modify: `src/scrapbook/pageTurnMotion.ts`
- Modify: `src/scrapbook/useSwipeGesture.ts`
- Modify: `src/scrapbook/usePageTurner.ts`
- Modify: `src/scrapbook/PageTurner.tsx`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/scrapbook.css`

Do not modify content, the 15 friend entries, layout recipes, dependencies, lockfiles, viewport metadata, cover behavior, dialogs, reduced-motion behavior, accessibility styles, or hosting files.

Preserve the established release thresholds (`44px`, `24px`, `0.45px/ms`), latest-valid one-slot buffering, landed-only page updates, reversal cancellation, retained cover, no-scroll mobile viewport, and existing settlement timing.

### Task 1: Implement the connected page-physics repair

**Files:**

- Modify: `src/scrapbook/pageTurnMotion.ts`
- Modify: `src/scrapbook/useSwipeGesture.ts`
- Modify: `src/scrapbook/usePageTurner.ts`
- Modify: `src/scrapbook/PageTurner.tsx`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/scrapbook.css`

- [ ] **Step 1: Add projected-edge progress for mobile direct manipulation**

In `src/scrapbook/pageTurnMotion.ts`, retain `progressForDistance` for desktop and add this exported helper immediately after it:

```ts
export function progressForProjectedEdge(
  distanceTowardDirectionPx: number,
  pageWidthPx: number,
): number {
  const distance = Math.max(0, distanceTowardDirectionPx);
  const width = Math.max(1, pageWidthPx);
  const projectedEdge = Math.max(-1, Math.min(1, 1 - distance / width));

  return clampProgress(Math.acos(projectedEdge) / Math.PI);
}
```

This maps zero movement to zero progress, one page-width to `0.5`/about 90 degrees, two page-widths to a complete turn, and reversal past the pointer-down point back to zero.

In `src/scrapbook/useSwipeGesture.ts`, import `ResponsiveMode` and `progressForProjectedEdge`:

```ts
import type { ResponsiveMode } from "../layouts/types";
import {
  clickSuppressionDistance,
  directionLockDistance,
  progressForDistance,
  progressForProjectedEdge,
  shouldCommitSwipe,
} from "./pageTurnMotion";
```

Add `mode` to `SwipeGestureOptions`:

```ts
type SwipeGestureOptions = {
  enabled: boolean;
  directManipulationEnabled: boolean;
  mode: ResponsiveMode;
  onDragStart: (direction: TurnDirection) => TurnSnapshot | null;
  onDragProgress: (turnId: number, progress: number) => void;
  onDragRelease: (release: GestureRelease) => void;
  onDragCancel: (turnId: number, progress: number) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};
```

Add this helper beside the existing direction/velocity helpers:

```ts
function dragProgress(
  distanceTowardDirectionPx: number,
  surfaceWidthPx: number,
  mode: ResponsiveMode,
): number {
  return mode === "mobile"
    ? progressForProjectedEdge(distanceTowardDirectionPx, surfaceWidthPx)
    : progressForDistance(distanceTowardDirectionPx, surfaceWidthPx);
}
```

Destructure `mode` in `useSwipeGesture`, and replace both pointer-move and pointer-up calls to `progressForDistance(...)` with:

```ts
const progress = dragProgress(
  distanceTowardDirectionPx,
  surfaceWidth.current,
  mode,
);
```

In `src/scrapbook/PageTurner.tsx`, pass the existing responsive mode into the hook:

```ts
useSwipeGesture({
  enabled,
  directManipulationEnabled: turnState.phase === "idle",
  mode,
  // existing callbacks remain unchanged
});
```

Do not change the release-distance or velocity values. Keep requestAnimationFrame scheduling and pointer capture unchanged.

- [ ] **Step 2: Reject direct drag at every missing boundary**

In `src/scrapbook/usePageTurner.ts`, replace the special-case missing-destination guard in `beginDrag` with:

```ts
const sourcePageIndex = activePageIndexRef.current;
const destinationPageIndex = adjacentFrom(sourcePageIndex, direction);

if (destinationPageIndex === null) {
  return null;
}
```

Create the snapshot without a fake same-page destination:

```ts
const turn: TurnSnapshot = {
  id: nextTurnId.current + 1,
  direction,
  sourcePageIndex,
  destinationPageIndex,
  canCommit: true,
  mode,
};
```

Leave `canCommit` and the settlement guard in place for compatibility. Do not add a final-index guard to `next()`, because queued navigation must continue to validate against its projected landing page.

- [ ] **Step 3: Provide the previous mobile page as parked-leaf content**

In `src/scrapbook/Scrapbook.tsx`, create a non-engageable renderer beside `sourceContent` and `destinationContent`:

```tsx
const parkedPreviousContent =
  mode === "mobile" && turner.activePageIndex > 0 ? (
    <SpreadRenderer
      activePageIndex={turner.activePageIndex - 1}
      decorationLabels={content.recipeDecorationLabels}
      desktopSpreads={desktopSpreads}
      engagementEnabled={false}
      mode={mode}
      onRememberPage={turner.rememberPage}
      pages={pages}
    />
  ) : null;
```

Pass it to `PageTurner`:

```tsx
<PageTurner
  // existing props
  parkedPreviousContent={parkedPreviousContent}
>
```

In `src/scrapbook/PageTurner.tsx`, add the prop:

```ts
type PageTurnerProps = {
  children: ReactNode;
  sourceContent: ReactNode | null;
  destinationContent: ReactNode | null;
  parkedPreviousContent: ReactNode | null;
  // existing props
};
```

Destructure it and derive the idle-only display flag after `activeTurn`:

```ts
const showParkedLeaf =
  mode === "mobile" && activeTurn === null && parkedPreviousContent !== null;
```

Render the parked sheet and independent gesture strip immediately before `.page-turner__content`:

```tsx
{showParkedLeaf ? (
  <>
    <div aria-hidden="true" className="page-turner__parked-leaf">
      <div
        className="page-turner__leaf-face page-turner__leaf-face--back"
        data-paper-back
      >
        <div className="page-turner__visual-composition">
          {parkedPreviousContent}
        </div>
      </div>
    </div>
    <span aria-hidden="true" className="page-turner__parked-grab-zone" />
  </>
) : null}
```

The visual sheet has no pointer events. The transparent grab zone receives pointer events and bubbles them to the existing `PageTurner` handlers, keeping the true page width as the geometry reference. Do not put interactive page content inside the grab zone.

- [ ] **Step 4: Correct desktop shadows and style the parked mobile sheet**

In `src/styles/scrapbook.css`, replace the `.scrapbook-book` shadow/filter block:

```css
box-shadow:
  var(--shadow-book),
  0 2rem 1.4rem rgb(23 12 8 / 28%),
  inset 0 0 0 2px rgb(237 212 175 / 12%);
container-name: scrapbook-book;
container-type: size;
transform-style: preserve-3d;
```

Delete `filter: drop-shadow(...)`. The large table shadow now follows only the fixed book rectangle and cannot include the protruding turning leaf.

Add `.page-turner__parked-leaf` to the existing full-width/full-height selector and absolute-position selector:

```css
.page-turner__scene,
.page-turner__destination,
.page-turner__turning-leaf,
.page-turner__parked-leaf,
.page-turner__leaf-face,
.page-turner__visual-composition {
  width: 100%;
  height: 100%;
}
```

```css
.page-turner__scene,
.page-turner__destination,
.page-turner__turning-leaf,
.page-turner__parked-leaf,
.page-turner__leaf-face,
.page-turner__cast-shadow,
.page-turner__gutter-shade {
  position: absolute;
}
```

Add these parked-sheet rules after the mobile turning-leaf geometry:

```css
.page-turner[data-mode="mobile"] .page-turner__parked-leaf {
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transform: rotateY(-178deg);
  transform-origin: left center;
  transform-style: preserve-3d;
}

.page-turner__parked-grab-zone {
  position: absolute;
  top: 0;
  right: 100%;
  bottom: 0;
  z-index: 5;
  width: clamp(3.25rem, 16cqw, 4rem);
  pointer-events: auto;
  touch-action: pan-y pinch-zoom;
}
```

The existing mobile `.page-turner__leaf-face--back .page-turner__visual-composition` rule supplies faint mirrored previous-page content.

Inside the existing mobile media query, allow the parked sheet and hit strip to extend over the cover:

```css
.scrapbook-experience[data-mode="mobile"] .scrapbook-page-region {
  overflow: visible;
}
```

Keep `.mobile-page { overflow: hidden; }`, so only the physical parked sheet escapes the current page rectangle.

After the cast-shadow and gutter definitions, suppress the two transient desktop rectangles:

```css
.page-turner[data-mode="desktop"] .page-turner__cast-shadow,
.page-turner[data-mode="desktop"] .page-turner__gutter-shade {
  display: none;
}
```

Retain the permanent `.scrapbook-book::after` spine, leaf shading, leaf edge, face backgrounds, and mobile gutter/shadow rules.

- [ ] **Step 5: Run implementation-level source and build checks**

Run under Node 22.12.0:

```bash
/Users/yonathan/.nvm/versions/node/v22.12.0/bin/node --version
/Users/yonathan/.nvm/versions/node/v22.12.0/bin/node \
  /Users/yonathan/.nvm/versions/node/v22.12.0/lib/node_modules/npm/bin/npm-cli.js \
  run build
git diff --check
git status --short
```

Expected: Node `v22.12.0`; TypeScript and Vite succeed; 70 modules or the current expected module count transform; only the six intended production files are modified.

Run exact source assertions:

```bash
rg -n \
  'progressForProjectedEdge|parkedPreviousContent|page-turner__parked-leaf|page-turner__parked-grab-zone' \
  src/scrapbook src/styles/scrapbook.css

if rg -n 'filter:[[:space:]]*drop-shadow' src/styles/scrapbook.css; then
  exit 1
else
  echo "descendant-sensitive book shadow removed"
fi

git diff --exit-code HEAD -- \
  src/content/scrapbook.ts \
  src/layouts/recipes \
  package.json \
  package-lock.json \
  index.html \
  src/styles/accessibility.css
```

Expected: new physical-continuity symbols are present, no book filter remains, and protected files have no diff.

- [ ] **Step 6: Commit the complete implementation once**

```bash
git add \
  src/scrapbook/pageTurnMotion.ts \
  src/scrapbook/useSwipeGesture.ts \
  src/scrapbook/usePageTurner.ts \
  src/scrapbook/PageTurner.tsx \
  src/scrapbook/Scrapbook.tsx \
  src/styles/scrapbook.css
git commit -m "fix: preserve physical page turn continuity"
```

### Task 2: Run one consolidated visual and interaction review

**Files:**

- Review all six implementation files from Task 1
- Modify only a file with an observed defect

- [ ] **Step 1: Start the browser review surface**

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

Open the served worktree, confirm the correct branch in the server process, and inspect the console throughout. Use a different free port only if 4174 already belongs to another project.

- [ ] **Step 2: Verify desktop physical continuity at 1440 by 900**

Check idle, slow forward drag, forward settlement, slow backward drag, and backward settlement:

- no rectangular shadow follows the protruding leaf outside the book;
- no 48%-wide translucent box overlays the stationary page;
- the centre divider retains one consistent width, gradient, and vertical alignment throughout;
- the leaf still has two populated faces, edge shading, face shading, and a clear 3D hinge;
- one leaf exists during motion and zero after landing; and
- source/destination content and landed-only progress remain correct.

Inspect computed style during a desktop turn:

```js
({
  bookFilter: getComputedStyle(document.querySelector('.scrapbook-book')).filter,
  castDisplay: getComputedStyle(document.querySelector('.page-turner__cast-shadow')).display,
  gutterDisplay: getComputedStyle(document.querySelector('.page-turner__gutter-shade')).display,
});
```

Expected: `bookFilter` is `none`; desktop cast and animated gutter display as `none`.

- [ ] **Step 3: Verify mobile parked paper and backward pickup**

At 390 by 844 and 320 by 568:

- opening page has no parked history leaf;
- after one forward landing, exactly one `.page-turner__parked-leaf` remains idle;
- it visibly extends left over the retained blue cover with faint mirrored previous-page content;
- the current page remains clipped and readable;
- a pointer beginning inside `.page-turner__parked-grab-zone` and moving right produces the existing backward leaf from the same resting position;
- the parked leaf disappears while the active scene owns the sheet and returns appropriately after landing/cancellation;
- there is never more than one parked sheet or one active turning leaf; and
- root viewport dimensions and scroll position remain contained at scale 1.

- [ ] **Step 4: Verify finger-aligned mobile geometry**

On a mobile page of measured width `w`, drag forward slowly by approximately `0.25w`, `0.5w`, and `1.0w`. Inspect the leaf transform or computed rotation.

Expected approximate physical angles:

- `0.25w` -> 41 degrees;
- `0.5w` -> 60 degrees;
- `1.0w` -> 90 degrees.

The paper edge must not reach the spine near `0.36w`, which was the old behavior. Reversal across the pointer-down point returns to zero. Release thresholds remain 44px slow or 24px at 0.45px/ms, and release settlement completes or cancels cleanly.

If genuine touch is available, repeat a slow drag directly. Otherwise report final tactile alignment as requiring the user's real-device confirmation rather than inferring it.

- [ ] **Step 5: Verify hard boundaries and retained behavior**

At the last desktop spread and last mobile page, attempt forward control, edge tap, Arrow/Page key, fallback swipe, and direct leftward drag. Expected: no page, active scene, turning leaf, pending intent, progress, or announcement change.

Then verify:

- backward drag from the last page works;
- backward swipe on the opening page still closes the cover;
- rapid valid buffering still remembers only the latest direction;
- direction reversal still cancels;
- notes and controls do not accidentally start a page turn;
- the retained cover remains visible desktop/mobile; and
- no console error or warning appears.

- [ ] **Step 6: Run the final build and scope audit**

```bash
/Users/yonathan/.nvm/versions/node/v22.12.0/bin/node \
  /Users/yonathan/.nvm/versions/node/v22.12.0/lib/node_modules/npm/bin/npm-cli.js \
  run build
git diff --check 329fd83..HEAD
git diff --name-only 329fd83..HEAD
git status --short --branch
```

Expected: production build passes; no whitespace errors; only the implementation plan and six approved production files differ from baseline; worktree is clean.

- [ ] **Step 7: Review once after the complete implementation**

Perform one spec-compliance and code-quality review of the complete baseline-to-head diff. Fix every Critical or Important issue, repeat the affected browser check and full build, and commit only observed corrections with a defect-specific message. Do not conduct per-step or per-file review cycles.

## Completion criteria

Implementation is complete only when:

- desktop turning has no moving rectangular shadow and uses one uniform centre divider;
- mobile idle pages after the opening retain one real previous-page back over the blue cover;
- the visible parked-paper zone starts a backward pull;
- mobile projected paper motion follows inverse-cosine finger geometry rather than the old fast linear mapping;
- the final page cannot create a forward leaf by any input path;
- established buffering, reversal, notes, cover, containment, and landed-only semantics remain intact;
- TypeScript and Vite build successfully under Node 22.12.0;
- every unavailable real-device check is listed explicitly;
- no unit tests were created or run; and
- no unrelated file changed.

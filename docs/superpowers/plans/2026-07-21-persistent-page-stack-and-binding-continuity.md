# Persistent Page Stack and Binding Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile page history behave as a persistent physical stack, keep one unchanged desktop binding through every turn, and slow button-triggered turns without changing direct drag feel.

**Architecture:** Derive a bounded two-page mobile history stack from the active page or frozen turn snapshot, render it independently beneath the active leaf, and use lightweight paper layers for deeper history. Keep one desktop spine mounted inside the page-turn scene at all times, changing only the nearly-flat leaf's layer at the binding endpoints. Automatic timing remains isolated from gesture progress and release settlement.

**Tech Stack:** React 19, TypeScript 6, CSS 3D transforms/WAAPI, Vite 6, in-app browser visual verification.

**Testing constraint:** The user explicitly requested no unit tests. Verification uses TypeScript/Vite production builds, source/diff audits, browser DOM measurements, screenshots, and interaction checks.

---

## File map

- `src/scrapbook/pageTurnMotion.ts`: automatic duration and fallback safety timing.
- `src/scrapbook/Scrapbook.tsx`: derive the stable mobile history indices from idle state or the frozen turn snapshot and render at most two page compositions.
- `src/scrapbook/PageTurner.tsx`: accept the history stack, keep it mounted through turns, keep the desktop scene/spine mounted, and coordinate endpoint leaf layering.
- `src/styles/scrapbook.css`: physical history depth, left-sheet grab area, persistent desktop binding, and endpoint layer defaults.

### Task 1: Slow only automatic turns

**Files:**
- Modify: `src/scrapbook/pageTurnMotion.ts:52-57`
- Modify: `src/scrapbook/pageTurnMotion.ts:160-162`

- [ ] **Step 1: Increase the automatic duration and preserve fallback margin**

Change the two timing exports to:

```ts
export const automaticTurnDurationMs = 450;

export function fallbackDelayMs(durationMs: number): number {
  return durationMs + 120;
}
```

Do not change `turnEasing`, gesture duration calculation, swipe thresholds, or pointer-progress geometry.

- [ ] **Step 2: Build and audit the isolated timing path**

Run:

```bash
npm run build
rg -n "automaticTurnDurationMs|fallbackDelayMs|turnEasing" src/scrapbook
```

Expected: TypeScript and Vite exit successfully; automatic turns resolve to `450ms`; the fallback adds `120ms`; the shared easing is unchanged.

- [ ] **Step 3: Commit the timing foundation**

```bash
git add src/scrapbook/pageTurnMotion.ts
git commit -m "fix: tune physical page turn timing"
```

### Task 2: Derive and render the persistent mobile history stack

**Files:**
- Modify: `src/scrapbook/Scrapbook.tsx:145-172`
- Modify: `src/scrapbook/Scrapbook.tsx:292-317`
- Modify: `src/scrapbook/PageTurner.tsx:13-43`
- Modify: `src/scrapbook/PageTurner.tsx:430-470`
- Modify: `src/styles/scrapbook.css:131-151`
- Modify: `src/styles/scrapbook.css:329-354`

- [ ] **Step 1: Replace the single parked-page prop with an explicit bounded stack type**

In `PageTurner.tsx`, export and use:

```ts
export type ParkedPageLayer = Readonly<{
  pageIndex: number;
  content: ReactNode;
}>;

type PageTurnerProps = {
  children: ReactNode;
  sourceContent: ReactNode | null;
  destinationContent: ReactNode | null;
  parkedPageStack: readonly ParkedPageLayer[];
  parkedHistoryCount: number;
  mode: ResponsiveMode;
  reducedMotion: boolean;
  enabled: boolean;
  isBusy: boolean;
  turnState: PageTurnState;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onDragStart: (direction: TurnDirection) => TurnSnapshot | null;
  onDragProgress: (turnId: number, progress: number) => void;
  onDragRelease: (release: GestureRelease) => void;
  onDragCancel: (turnId: number, progress: number) => void;
  onTurnComplete: (turnId: number) => void;
  onLayoutChange: () => void;
};
```

Replace `parkedPreviousContent` in the function parameters with `parkedPageStack` and `parkedHistoryCount`.

- [ ] **Step 2: Derive stable history ownership from the frozen turn**

In `Scrapbook.tsx`, import `type ParkedPageLayer` and replace `parkedPreviousContent` with:

```tsx
const parkedStackTopPageIndex =
  mode !== "mobile"
    ? -1
    : visualTurn
      ? Math.min(
          visualTurn.sourcePageIndex,
          visualTurn.destinationPageIndex,
        ) - 1
      : turner.activePageIndex - 1;
const parkedStackStartPageIndex = Math.max(
  0,
  parkedStackTopPageIndex - 1,
);
const parkedPageStack: ParkedPageLayer[] =
  parkedStackTopPageIndex < 0
    ? []
    : Array.from(
        {
          length:
            parkedStackTopPageIndex - parkedStackStartPageIndex + 1,
        },
        (_, offset) => {
          const pageIndex = parkedStackStartPageIndex + offset;

          return {
            pageIndex,
            content: (
              <SpreadRenderer
                activePageIndex={pageIndex}
                decorationLabels={content.recipeDecorationLabels}
                desktopSpreads={desktopSpreads}
                engagementEnabled={false}
                mode={mode}
                onRememberPage={turner.rememberPage}
                pages={pages}
              />
            ),
          };
        },
      );
const parkedHistoryCount = Math.max(0, parkedStackTopPageIndex + 1);
```

Pass both values to `PageTurner`:

```tsx
parkedHistoryCount={parkedHistoryCount}
parkedPageStack={parkedPageStack}
```

This must produce idle `i - 1`, forward `source - 1`, and backward `destination - 1` as the stable top, with the active backward leaf excluded.

- [ ] **Step 3: Keep the stable stack mounted during active turns**

Replace `showParkedLeaf` and its JSX in `PageTurner.tsx` with:

```tsx
const showParkedStack =
  mode === "mobile" && parkedPageStack.length > 0;
const showParkedGrabZone = showParkedStack && activeTurn === null;
```

```tsx
{showParkedStack ? (
  <>
    <div
      aria-hidden="true"
      className="page-turner__parked-stack"
      data-has-deeper-history={
        parkedHistoryCount > parkedPageStack.length || undefined
      }
      inert
    >
      {parkedHistoryCount > parkedPageStack.length ? (
        <span className="page-turner__parked-depth" />
      ) : null}
      {parkedPageStack.map((page, index) => {
        const depth = parkedPageStack.length - index - 1;

        return (
          <div
            className="page-turner__parked-leaf"
            data-stack-depth={depth}
            key={page.pageIndex}
          >
            <div
              className="page-turner__leaf-face page-turner__leaf-face--back"
              data-paper-back
            >
              <div className="page-turner__visual-composition">
                {page.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
    {showParkedGrabZone ? (
      <span
        aria-hidden="true"
        className="page-turner__parked-grab-zone"
      />
    ) : null}
  </>
) : null}
```

Do not condition the stack itself on `activeTurn === null`.

- [ ] **Step 4: Add bounded physical depth and expand the idle grab sheet**

Add the stack wrapper/depth elements to the absolute-size selectors, then replace the single-leaf rules with:

```css
.page-turner[data-mode="mobile"] .page-turner__parked-stack {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transform-style: preserve-3d;
}

.page-turner[data-mode="mobile"] .page-turner__parked-leaf,
.page-turner[data-mode="mobile"] .page-turner__parked-depth,
.page-turner[data-mode="mobile"] .page-turner__parked-depth::before,
.page-turner[data-mode="mobile"] .page-turner__parked-depth::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform-origin: left center;
  transform-style: preserve-3d;
}

.page-turner[data-mode="mobile"]
  .page-turner__parked-leaf[data-stack-depth="0"] {
  z-index: 3;
  transform: rotateY(-178deg);
}

.page-turner[data-mode="mobile"]
  .page-turner__parked-leaf[data-stack-depth="1"] {
  z-index: 2;
  transform: translateY(0.18rem) translateZ(-0.8px) rotateY(-178deg);
}

.page-turner[data-mode="mobile"] .page-turner__parked-depth {
  z-index: 1;
}

.page-turner[data-mode="mobile"] .page-turner__parked-depth::before,
.page-turner[data-mode="mobile"] .page-turner__parked-depth::after {
  content: "";
  background: var(--color-paper);
  box-shadow: inset 0 0 1rem rgb(84 52 29 / 10%);
}

.page-turner[data-mode="mobile"] .page-turner__parked-depth::before {
  transform: translateY(0.34rem) translateZ(-1.6px) rotateY(-178deg);
}

.page-turner[data-mode="mobile"] .page-turner__parked-depth::after {
  transform: translateY(0.5rem) translateZ(-2.4px) rotateY(-178deg);
}

.page-turner__parked-grab-zone {
  position: absolute;
  top: 0;
  right: 100%;
  bottom: 0;
  z-index: 5;
  width: 100%;
  pointer-events: auto;
  touch-action: pan-y pinch-zoom;
}
```

The top real sheet must remain exactly at `rotateY(-178deg)` so the active-leaf handoff has no positional snap. Only deeper sheets receive offsets.

- [ ] **Step 5: Build and inspect stack ownership in source**

Run:

```bash
npm run build
rg -n "parkedStackTopPageIndex|parkedPageStack|parkedHistoryCount|activeTurn === null" src/scrapbook
```

Expected: build succeeds; `activeTurn === null` controls only the grab zone, never the stable stack; no reference to `parkedPreviousContent` remains.

- [ ] **Step 6: Commit the mobile stack**

```bash
git add src/scrapbook/Scrapbook.tsx src/scrapbook/PageTurner.tsx src/styles/scrapbook.css
git commit -m "fix: preserve mobile scrapbook page stack"
```

### Task 3: Replace the desktop binding swap with one persistent spine

**Files:**
- Modify: `src/scrapbook/Scrapbook.tsx:275-285`
- Modify: `src/scrapbook/PageTurner.tsx:1-120`
- Modify: `src/scrapbook/PageTurner.tsx:225-370`
- Modify: `src/scrapbook/PageTurner.tsx:480-540`
- Modify: `src/styles/scrapbook.css:72-98`
- Modify: `src/styles/scrapbook.css:157-199`
- Modify: `src/styles/scrapbook.css:350-410`

- [ ] **Step 1: Define endpoint layer behavior**

Add near the PageTurner types:

```ts
const desktopBackwardLiftProgress = 0.1;
const desktopForwardTuckProgress = 0.9;

function turningLeafZIndex(input: {
  mode: ResponsiveMode;
  direction: TurnDirection;
  progress: number;
}): number {
  if (input.mode !== "desktop") {
    return 40;
  }

  const tuckedUnderBinding =
    input.direction === "forward"
      ? input.progress >= desktopForwardTuckProgress
      : input.progress <= desktopBackwardLiftProgress;

  return tuckedUnderBinding ? 38 : 40;
}
```

In `applyProgress`, set both transform and layer:

```ts
if (leaf) {
  leaf.style.transform = `rotateY(${angle}deg)`;
  leaf.style.zIndex = `${turningLeafZIndex({
    mode,
    direction,
    progress,
  })}`;
}
```

- [ ] **Step 2: Put endpoint transitions into settling keyframes**

Replace midpoint-only progress-stop construction with ordered candidate stops:

```ts
const transitionProgress =
  mode !== "desktop"
    ? []
    : turn.direction === "forward"
      ? [desktopForwardTuckProgress - 0.001, desktopForwardTuckProgress + 0.001]
      : [desktopBackwardLiftProgress - 0.001, desktopBackwardLiftProgress + 0.001];
const candidates = [0.5, ...transitionProgress].filter(
  (progress) =>
    progress > Math.min(startProgress, destinationProgress) &&
    progress < Math.max(startProgress, destinationProgress),
);
candidates.sort((a, b) =>
  destinationProgress > startProgress ? a - b : b - a,
);
const progressStops = [
  startProgress,
  ...candidates,
  destinationProgress,
];
```

Add `zIndex` to every leaf frame:

```ts
const leafFrames = progressStops.map((progress) => ({
  offset: offsetFor(progress),
  transform: `rotateY(${turnAngleDegrees({
    mode,
    direction: turn.direction,
    progress,
  })}deg)`,
  zIndex: `${turningLeafZIndex({
    mode,
    direction: turn.direction,
    progress,
  })}`,
}));
```

This switches layer only across the two adjacent threshold frames, including gesture cancellation paths.

- [ ] **Step 3: Keep the desktop scene and binding mounted**

Render the scene whenever `mode === "desktop" || activeTurn !== null`. Put the spine outside the `activeTurn` conditional and put destination, stationary source, shadows, and turning leaf inside it:

```tsx
{mode === "desktop" || activeTurn ? (
  <div aria-hidden="true" className="page-turner__scene" inert>
    {mode === "desktop" ? (
      <span className="page-turner__scene-spine" />
    ) : null}
    {activeTurn ? (
      <>
        <div className="page-turner__destination" ref={destinationRef}>
          {destinationContent}
        </div>

        {mode === "desktop" ? (
          <div className="page-turner__stationary-source">
            <div className="page-turner__visual-composition">
              {sourceContent}
            </div>
          </div>
        ) : null}

        <span
          className="page-turner__cast-shadow"
          ref={castShadowRef}
        />
        <span
          className="page-turner__gutter-shade"
          ref={gutterShadeRef}
        />

        <div className="page-turner__turning-leaf" ref={leafRef}>
          <div className="page-turner__leaf-face page-turner__leaf-face--front">
            <div className="page-turner__visual-composition">
              {leafFrontContent}
            </div>
          </div>
          <div
            className="page-turner__leaf-face page-turner__leaf-face--back"
            data-paper-back={mode === "mobile" || undefined}
          >
            <div className="page-turner__visual-composition">
              {leafBackContent}
            </div>
          </div>
          <span
            className="page-turner__leaf-shading"
            ref={shadingRef}
          />
          <span className="page-turner__leaf-edge" ref={edgeRef} />
        </div>
      </>
    ) : null}
  </div>
) : null}
```

Remove the active-only copy of `.page-turner__scene-spine` and remove `data-page-turning` from `.scrapbook-book` in `Scrapbook.tsx`.

- [ ] **Step 4: Make the persistent spine the only desktop binding**

Replace the conditional pseudo-element hiding rule with:

```css
.scrapbook-experience[data-mode="desktop"] .scrapbook-book::after {
  display: none;
}
```

Keep the mobile pseudo-element styles unchanged. Update the persistent scene spine to paint above stationary pages without a separate perspective offset:

```css
.page-turner__scene-spine {
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 39;
  width: clamp(0.7rem, 1.8cqw, 1.45rem);
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(39 21 14 / 28%),
    rgb(255 245 225 / 16%) 48%,
    rgb(39 21 14 / 34%)
  );
  box-shadow: 0 0 0.7rem rgb(45 24 15 / 25%);
  transform: translateX(-50%);
}
```

Add the no-frame backward endpoint default after the desktop leaf rules:

```css
.page-turner[data-mode="desktop"][data-turn="backward"]
  .page-turner__turning-leaf {
  z-index: 38;
}
```

The inline/keyframe layer becomes `40` after the first 10 percent of backward movement.

- [ ] **Step 5: Build and audit for a single desktop spine**

Run:

```bash
npm run build
rg -n "scene-spine|data-page-turning|scrapbook-book::after|turningLeafZIndex" src
```

Expected: build succeeds; one scene-spine JSX node exists; no `data-page-turning` remains; desktop disables the book pseudo-element; mobile retains it.

- [ ] **Step 6: Commit the binding continuity change**

```bash
git add src/scrapbook/PageTurner.tsx src/scrapbook/Scrapbook.tsx src/styles/scrapbook.css
git commit -m "fix: keep scrapbook binding visually continuous"
```

### Task 4: Consolidated implementation review

**Files:**
- Verify: `src/scrapbook/pageTurnMotion.ts`
- Verify: `src/scrapbook/Scrapbook.tsx`
- Verify: `src/scrapbook/PageTurner.tsx`
- Verify: `src/styles/scrapbook.css`

- [ ] **Step 1: Run final static verification**

```bash
git diff --check HEAD~2..HEAD
npm run build
git status --short
```

Expected: no whitespace errors; TypeScript/Vite succeeds; only known user-owned files, if any, remain uncommitted.

- [ ] **Step 2: Verify desktop binding and timing in the browser**

At a wide desktop viewport, capture and compare:

- idle;
- early and middle forward;
- late forward after the 90-percent tuck;
- idle after settlement;
- early backward before the 10-percent lift;
- middle backward; and
- idle after settlement.

Measure `.page-turner__scene-spine` in every state. Its bounding width, height, centre position, gradient, and shadow must remain unchanged. Confirm the leaf is above it during the middle arc and below it only at the nearly-flat endpoints. Confirm no full-sheet desktop shading rectangle is visible.

Measure a Next and Back button turn from scene mount to unmount. Each should be approximately `450ms`, allowing normal frame scheduling tolerance.

- [ ] **Step 3: Verify mobile stack continuity in tall and short viewports**

At representative tall and short phone viewports:

- move to at least page 4 and confirm two genuine parked leaves plus deeper paper edges;
- begin a forward turn and confirm the same stable stack remains mounted until the active page lands on top;
- begin a backward turn and confirm the active top sheet lifts while the next genuine page is already visible below;
- cancel both directions and confirm no duplicate, snap, or blue-cover flash;
- pull backward from the full visibly exposed left sheet;
- run rapid Next/Back sequences and confirm stack ownership follows the frozen turn snapshot;
- return to the opening page and confirm the blue cover appears only when no history remains; and
- attempt a forward gesture on the final page and confirm no scene is created.

- [ ] **Step 4: Reconfirm finger tracking and runtime health**

Hold a forward mobile drag from the right edge to a known x-coordinate. Compare that pointer coordinate with the moving leaf's projected outer edge; they should stay aligned within normal subpixel/browser rounding. Confirm direct drag uses no `450ms` automatic delay.

Inspect browser logs and require no application errors. Open and close representative notes after turns to guard interaction behavior.

- [ ] **Step 5: Request one final code review**

Dispatch a read-only reviewer only after all implementation and browser checks are complete. Fix every Critical or Important finding, rerun the affected verification, and report any device-only checks rather than inferring them.

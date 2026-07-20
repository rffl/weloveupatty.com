# Patty Scrapbook Physical Page-Turn Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every scrapbook page follow the user's finger as a two-sided physical sheet, settle quickly, accept one latest buffered adjacent-navigation intent, and make mobile swipes and edge taps modestly easier without weakening accessibility.

**Architecture:** Replace the early-commit animation lock with an explicit `idle → dragging → settling` lifecycle whose logical page changes only when the sheet lands. Pointer sampling remains isolated in `useSwipeGesture`; `usePageTurner` owns source/destination state, commitment, boundaries, and one pending adjacent direction; `PageTurner` owns an imperative requestAnimationFrame/Web Animations API scene with inert source/destination copies and correct desktop/mobile faces.

**Tech Stack:** React 19, Vite 6, TypeScript 6, handcrafted CSS, native Pointer Events, `requestAnimationFrame`, Web Animations API, npm under Node 22.12.0.

---

## Guardrails and file map

Read the approved contract before beginning each review pass:

- `docs/superpowers/specs/2026-07-21-physical-page-turn-interaction-design.md`

The user explicitly prohibited unit tests. Do not add or run unit tests, install a test runner, create snapshots, or add a `test` script. Every task uses source assertions, `git diff --check`, the existing TypeScript/Vite build, and focused browser/device interaction checks.

Preserve all existing content and art direction. Do not change `src/content/scrapbook.ts`, `src/layouts/recipes`, photo placeholders, the retained-cover design, mobile viewport geometry, reading-view behavior, dependencies, hosting metadata, or deployment.

Files created by this plan:

- `src/scrapbook/pageTurnMotion.ts` — shared motion types, thresholds, adjacency, progress, commitment, angle, settlement, and fallback calculations.
- `src/scrapbook/useReducedMotion.ts` — reactive reduced-motion preference used by the JavaScript-driven settlement path.

Files modified by this plan:

- `src/scrapbook/usePageTurner.ts` — landed page state, turn lifecycle, one latest pending intent, boundaries, completion, and resize cleanup.
- `src/scrapbook/useSwipeGesture.ts` — direction lock, recent velocity samples, direct drag progress, 44px/24px commitment measurements, vertical cancellation, and buffered swipes.
- `src/scrapbook/PageTurner.tsx` — gesture surface, physical front/back leaf, stationary desktop half, destination underlay, rAF drag updates, WAAPI settlement, edge taps, and resize observer.
- `src/scrapbook/Scrapbook.tsx` — landed semantic renderer plus inert source/destination visual copies and continuous busy wiring.
- `src/components/ScrapbookControls.tsx` — keep controls available for one buffered action while settling, but unavailable during a live drag or true boundary.
- `src/styles/tokens.css` — remove the old fixed 520ms animation duration and retain the shared physical easing token.
- `src/styles/scrapbook.css` — stable perspective scene, mobile/desktop sheet geometry, front/back cropping, edge/curl/shadow layers, turn overflow, and buffered-control presentation.
- `src/styles/accessibility.css` — remove obsolete CSS page-turn keyframes and define the reduced-motion visual path without 3D scrubbing.

`SpreadRenderer.tsx` remains unchanged. The existing `engagementEnabled={false}` contract is sufficient for inert visual copies; do not create a second renderer or content model.

### Task 1: Define the physical motion contract

**Files:**

- Create: `src/scrapbook/pageTurnMotion.ts`
- Create: `src/scrapbook/useReducedMotion.ts`

- [ ] **Step 1: Add the shared turn types, thresholds, and calculations**

Create `src/scrapbook/pageTurnMotion.ts` with this complete content:

```ts
import type { ResponsiveMode } from "../layouts/types";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";

export type TurnDirection = "forward" | "backward";
export type TurnSettleTarget = "source" | "destination";
export type TurnInputSource = "gesture" | "automatic";

export type TurnSnapshot = Readonly<{
  id: number;
  direction: TurnDirection;
  sourcePageIndex: number;
  destinationPageIndex: number;
  canCommit: boolean;
  mode: ResponsiveMode;
}>;

export type PageTurnState =
  | Readonly<{ phase: "idle" }>
  | Readonly<{ phase: "dragging"; turn: TurnSnapshot }>
  | Readonly<{
      phase: "settling";
      turn: TurnSnapshot;
      settleTarget: TurnSettleTarget;
      startProgress: number;
      durationMs: number;
    }>;

export type PendingTurnIntent = Readonly<{
  direction: TurnDirection;
  targetPageIndex: number;
}>;

export type GestureRelease = Readonly<{
  turnId: number;
  progress: number;
  distanceTowardDirectionPx: number;
  velocityTowardDirectionPxPerMs: number;
  horizontalDominant: boolean;
}>;

export const idlePageTurnState: PageTurnState = { phase: "idle" };
export const swipeDistanceThreshold = 44;
export const flickDistanceThreshold = 24;
export const flickVelocityThreshold = 0.45;
export const directionLockDistance = 8;
export const clickSuppressionDistance = 8;
export const fullTurnDistanceRatio = 0.72;
export const minimumFullTurnDistance = 120;
export const automaticTurnDurationMs = 370;
export const reducedTurnDurationMs = 140;
export const turnEasing = "cubic-bezier(0.22, 0.7, 0.2, 1)";

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function progressForDistance(
  distanceTowardDirectionPx: number,
  pageWidthPx: number,
): number {
  const fullDistance = Math.max(
    minimumFullTurnDistance,
    pageWidthPx * fullTurnDistanceRatio,
  );

  return clampProgress(
    Math.max(0, distanceTowardDirectionPx) / fullDistance,
  );
}

export function shouldCommitSwipe(input: {
  distanceTowardDirectionPx: number;
  velocityTowardDirectionPxPerMs: number;
  horizontalDominant: boolean;
}): boolean {
  if (!input.horizontalDominant) {
    return false;
  }

  const distance = input.distanceTowardDirectionPx;
  const velocity = input.velocityTowardDirectionPxPerMs;

  return (
    distance >= swipeDistanceThreshold ||
    (distance >= flickDistanceThreshold &&
      velocity >= flickVelocityThreshold)
  );
}

export function adjacentPageIndex(input: {
  currentPageIndex: number;
  direction: TurnDirection;
  mode: ResponsiveMode;
  pageCount: number;
}): number | null {
  const lastPageIndex = Math.max(0, input.pageCount - 1);

  if (input.mode === "mobile") {
    const candidate =
      input.currentPageIndex + (input.direction === "forward" ? 1 : -1);

    return candidate >= 0 && candidate <= lastPageIndex ? candidate : null;
  }

  const spreadCount =
    1 + Math.ceil(Math.max(0, input.pageCount - 1) / 2);
  const currentSpread = desktopSpreadForPageIndex(input.currentPageIndex);
  const candidateSpread =
    currentSpread + (input.direction === "forward" ? 1 : -1);

  if (candidateSpread < 0 || candidateSpread >= spreadCount) {
    return null;
  }

  return firstPageIndexForDesktopSpread(candidateSpread);
}

export function settleDurationMs(input: {
  source: TurnInputSource;
  settleTarget: TurnSettleTarget;
  startProgress: number;
  velocityPxPerMs: number;
  reducedMotion: boolean;
}): number {
  if (input.reducedMotion) {
    return input.settleTarget === "destination" ? reducedTurnDurationMs : 1;
  }

  if (input.source === "automatic") {
    return automaticTurnDurationMs;
  }

  const progress = clampProgress(input.startProgress);

  if (input.settleTarget === "source") {
    return Math.round(140 + progress * 40);
  }

  const remaining = 1 - progress;
  const velocityReduction = Math.min(
    60,
    Math.max(0, input.velocityPxPerMs) * 60,
  );

  return Math.max(
    180,
    Math.min(320, Math.round(180 + remaining * 140 - velocityReduction)),
  );
}

export function fallbackDelayMs(durationMs: number): number {
  return Math.min(durationMs + 120, 500);
}

export function turnAngleDegrees(input: {
  mode: ResponsiveMode;
  direction: TurnDirection;
  progress: number;
}): number {
  const progress = clampProgress(input.progress);

  if (input.mode === "mobile") {
    return input.direction === "forward"
      ? -178 * progress
      : -178 * (1 - progress);
  }

  return input.direction === "forward" ? -178 * progress : 178 * progress;
}

export function turnDepth(progress: number): number {
  return Math.sin(Math.PI * clampProgress(progress));
}
```

This file is deliberately pure and dependency-free beyond the existing page-model helpers. Do not add a physics library or test dependency.

- [ ] **Step 2: Add a reactive reduced-motion hook for the JavaScript path**

Create `src/scrapbook/useReducedMotion.ts`:

```ts
import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function readReducedMotion(): boolean {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}
```

- [ ] **Step 3: Verify the isolated contract builds**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
git diff --check
git status --short
```

Expected: Node reports `v22.12.0`; TypeScript and Vite succeed; only the two new source files are untracked; `git diff --check` prints nothing.

- [ ] **Step 4: Commit the motion contract**

```bash
git add src/scrapbook/pageTurnMotion.ts src/scrapbook/useReducedMotion.ts
git commit -m "refactor: define physical page turn motion"
```

Expected: one focused commit containing only the two new files.

### Task 2: Model landed-page state and bounded pending navigation

**Files:**

- Modify: `src/scrapbook/usePageTurner.ts`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Replace early page commitment with the explicit lifecycle**

In `src/scrapbook/usePageTurner.ts`, remove the current `ActiveTurn`, `outgoingPageIndex`, fixed `turnFallbackDelay`, and `navigateToPage` implementation. Import the Task 1 contract and expose these public types:

```ts
import {
  adjacentPageIndex,
  clampProgress,
  fallbackDelayMs,
  idlePageTurnState,
  settleDurationMs,
  shouldCommitSwipe,
} from "./pageTurnMotion";
import type {
  GestureRelease,
  PageTurnState,
  PendingTurnIntent,
  TurnDirection,
  TurnInputSource,
  TurnSettleTarget,
  TurnSnapshot,
} from "./pageTurnMotion";

export type { TurnDirection, TurnSnapshot } from "./pageTurnMotion";

export type PreviousAction =
  | "ignored"
  | "page-turn-started"
  | "page-turn-queued"
  | "cover-closed";

type PageTurnerOptions = {
  pageCount: number;
  mode: ResponsiveMode;
  reducedMotion: boolean;
};
```

Inside `usePageTurner`, keep the existing cover state and landed `activePageIndex`, then replace the old turn refs/state with these synchronized state holders:

```ts
const [turnState, setTurnState] =
  useState<PageTurnState>(idlePageTurnState);
const [pendingIntent, setPendingIntent] =
  useState<PendingTurnIntent | null>(null);
const turnStateRef = useRef<PageTurnState>(idlePageTurnState);
const pendingIntentRef = useRef<PendingTurnIntent | null>(null);
const turnProgressRef = useRef(0);
const nextTurnId = useRef(0);
const fallbackTimer = useRef<number | null>(null);
const pendingLaunchFrame = useRef<number | null>(null);
const resolveTurnRef = useRef<(turnId: number, launchPending: boolean) => void>(
  () => undefined,
);
const requestDirectionRef = useRef<
  (direction: TurnDirection) => "ignored" | "started" | "queued"
>(() => "ignored");

const publishTurnState = useCallback((nextState: PageTurnState) => {
  turnStateRef.current = nextState;
  setTurnState(nextState);
}, []);

const publishPendingIntent = useCallback(
  (intent: PendingTurnIntent | null) => {
    pendingIntentRef.current = intent;
    setPendingIntent(intent);
  },
  [],
);
```

Add exact cleanup helpers. Every timer and animation-frame callback must be owned here rather than by a stale render:

```ts
const clearFallback = useCallback(() => {
  if (fallbackTimer.current !== null) {
    window.clearTimeout(fallbackTimer.current);
    fallbackTimer.current = null;
  }
}, []);

const clearPendingLaunch = useCallback(() => {
  if (pendingLaunchFrame.current !== null) {
    window.cancelAnimationFrame(pendingLaunchFrame.current);
    pendingLaunchFrame.current = null;
  }
}, []);

const commitPageIndex = useCallback((pageIndex: number) => {
  activePageIndexRef.current = pageIndex;
  setActivePageIndex(pageIndex);
}, []);

const armFallback = useCallback(
  (turnId: number, durationMs: number) => {
    clearFallback();
    fallbackTimer.current = window.setTimeout(() => {
      resolveTurnRef.current(turnId, true);
    }, fallbackDelayMs(durationMs));
  },
  [clearFallback],
);
```

Use one turn factory for automatic navigation. It records source and destination but does not mutate `activePageIndex`:

```ts
const beginAutomaticTurn = useCallback(
  (
    sourcePageIndex: number,
    destinationPageIndex: number,
    direction: TurnDirection,
  ) => {
    const turn: TurnSnapshot = {
      id: nextTurnId.current + 1,
      direction,
      sourcePageIndex,
      destinationPageIndex,
      canCommit: true,
      mode,
    };
    nextTurnId.current = turn.id;

    const durationMs = settleDurationMs({
      source: "automatic",
      settleTarget: "destination",
      startProgress: 0,
      velocityPxPerMs: 0,
      reducedMotion,
    });
    turnProgressRef.current = 0;
    publishTurnState({
      phase: "settling",
      turn,
      settleTarget: "destination",
      startProgress: 0,
      durationMs,
    });
    armFallback(turn.id, durationMs);
  },
  [armFallback, mode, publishTurnState, reducedMotion],
);
```

Add one projected-base resolver and one latest-wins queue. Invalid input must not erase an already valid pending direction:

```ts
const adjacentFrom = useCallback(
  (pageIndex: number, direction: TurnDirection) =>
    adjacentPageIndex({
      currentPageIndex: pageIndex,
      direction,
      mode,
      pageCount,
    }),
  [mode, pageCount],
);

const projectedBaseIndex = useCallback(() => {
  const current = turnStateRef.current;

  if (current.phase === "idle") {
    return activePageIndexRef.current;
  }

  if (
    current.phase === "settling" &&
    current.settleTarget === "destination"
  ) {
    return current.turn.destinationPageIndex;
  }

  return current.turn.sourcePageIndex;
}, []);

const queueDirection = useCallback(
  (direction: TurnDirection): "ignored" | "queued" => {
    if (turnStateRef.current.phase === "dragging") {
      return "ignored";
    }

    const targetPageIndex = adjacentFrom(projectedBaseIndex(), direction);

    if (targetPageIndex === null) {
      return "ignored";
    }

    publishPendingIntent({ direction, targetPageIndex });
    return "queued";
  }, [adjacentFrom, projectedBaseIndex, publishPendingIntent],
);
```

Add the common direction request path. A pending one-frame chain remains busy and may be replaced by newer valid input:

```ts
const requestDirection = useCallback(
  (direction: TurnDirection): "ignored" | "started" | "queued" => {
    if (
      turnStateRef.current.phase !== "idle" ||
      pendingIntentRef.current !== null
    ) {
      return queueDirection(direction);
    }

    const sourcePageIndex = activePageIndexRef.current;
    const destinationPageIndex = adjacentFrom(sourcePageIndex, direction);

    if (destinationPageIndex === null) {
      return "ignored";
    }

    beginAutomaticTurn(sourcePageIndex, destinationPageIndex, direction);
    return "started";
  }, [adjacentFrom, beginAutomaticTurn, queueDirection],
);

useLayoutEffect(() => {
  requestDirectionRef.current = requestDirection;
}, [requestDirection]);
```

Add drag lifecycle callbacks. `usePageTurner`, not the gesture hook, decides whether the measured release commits. At the final page, a forward drag still creates a non-committable copy of the source sheet so the paper can visibly tug and settle back; opening-page backward remains the valid retained-cover-close gesture and therefore does not create a false page leaf:

```ts
const beginDrag = useCallback(
  (direction: TurnDirection): TurnSnapshot | null => {
    if (
      !coverOpenRef.current ||
      turnStateRef.current.phase !== "idle" ||
      pendingIntentRef.current !== null
    ) {
      return null;
    }

    const sourcePageIndex = activePageIndexRef.current;
    const destinationPageIndex = adjacentFrom(sourcePageIndex, direction);

    if (
      destinationPageIndex === null &&
      direction === "backward" &&
      sourcePageIndex === 0
    ) {
      return null;
    }

    const turn: TurnSnapshot = {
      id: nextTurnId.current + 1,
      direction,
      sourcePageIndex,
      destinationPageIndex: destinationPageIndex ?? sourcePageIndex,
      canCommit: destinationPageIndex !== null,
      mode,
    };
    nextTurnId.current = turn.id;
    turnProgressRef.current = 0;
    publishTurnState({ phase: "dragging", turn });
    return turn;
  }, [adjacentFrom, mode, publishTurnState],
);

const updateDrag = useCallback((turnId: number, progress: number) => {
  const current = turnStateRef.current;

  if (current.phase === "dragging" && current.turn.id === turnId) {
    turnProgressRef.current = clampProgress(progress);
  }
}, []);

const settleDrag = useCallback(
  (
    release: GestureRelease,
    settleTarget: TurnSettleTarget,
    source: TurnInputSource = "gesture",
  ) => {
    const current = turnStateRef.current;

    if (current.phase !== "dragging" || current.turn.id !== release.turnId) {
      return;
    }

    const resolvedTarget =
      settleTarget === "destination" && !current.turn.canCommit
        ? "source"
        : settleTarget;
    const startProgress = clampProgress(release.progress);
    const durationMs = settleDurationMs({
      source,
      settleTarget: resolvedTarget,
      startProgress,
      velocityPxPerMs: release.velocityTowardDirectionPxPerMs,
      reducedMotion,
    });
    turnProgressRef.current = startProgress;
    publishTurnState({
      phase: "settling",
      turn: current.turn,
      settleTarget: resolvedTarget,
      startProgress,
      durationMs,
    });
    armFallback(current.turn.id, durationMs);
  },
  [armFallback, publishTurnState, reducedMotion],
);

const releaseDrag = useCallback(
  (release: GestureRelease) => {
    settleDrag(
      release,
      shouldCommitSwipe(release) ? "destination" : "source",
    );
  },
  [settleDrag],
);

const cancelDrag = useCallback(
  (turnId: number, progress = turnProgressRef.current) => {
    settleDrag(
      {
        turnId,
        progress,
        distanceTowardDirectionPx: 0,
        velocityTowardDirectionPxPerMs: 0,
        horizontalDominant: false,
      },
      "source",
    );
  },
  [settleDrag],
);
```

Resolve only the matching turn ID. Preserve the pending state until the chained request begins on the next frame, so `isBusy` never flickers false:

```ts
const resolveTurn = useCallback(
  (turnId: number, launchPending: boolean) => {
    const current = turnStateRef.current;

    if (current.phase === "idle" || current.turn.id !== turnId) {
      return;
    }

    clearFallback();
    clearPendingLaunch();

    const landedPageIndex =
      current.phase === "settling" &&
      current.settleTarget === "destination"
        ? current.turn.destinationPageIndex
        : current.turn.sourcePageIndex;
    commitPageIndex(landedPageIndex);
    turnProgressRef.current = 0;
    publishTurnState(idlePageTurnState);

    if (!launchPending) {
      publishPendingIntent(null);
      return;
    }

    if (pendingIntentRef.current === null) {
      publishPendingIntent(null);
      return;
    }

    pendingLaunchFrame.current = window.requestAnimationFrame(() => {
      pendingLaunchFrame.current = null;
      const nextIntent = pendingIntentRef.current;
      publishPendingIntent(null);

      if (nextIntent) {
        requestDirectionRef.current(nextIntent.direction);
      }
    });
  },
  [
    clearFallback,
    clearPendingLaunch,
    commitPageIndex,
    publishPendingIntent,
    publishTurnState,
  ],
);

useLayoutEffect(() => {
  resolveTurnRef.current = resolveTurn;
}, [resolveTurn]);

const completeSettle = useCallback((turnId: number) => {
  const current = turnStateRef.current;

  if (current.phase === "settling" && current.turn.id === turnId) {
    resolveTurnRef.current(turnId, true);
  }
}, []);

const resolveForLayoutChange = useCallback(() => {
  const current = turnStateRef.current;

  clearPendingLaunch();
  publishPendingIntent(null);

  if (current.phase !== "idle") {
    resolveTurnRef.current(current.turn.id, false);
  }
}, [clearPendingLaunch, publishPendingIntent]);
```

Retain the existing `openCover`, but replace `next`, `previous`, and `goToPage` with these boundary-safe paths:

```ts
const next = useCallback(() => {
  if (!coverOpenRef.current) {
    openCover();
    return;
  }

  requestDirection("forward");
}, [openCover, requestDirection]);

const previous = useCallback((): PreviousAction => {
  if (!coverOpenRef.current) {
    return "ignored";
  }

  if (
    turnStateRef.current.phase !== "idle" ||
    pendingIntentRef.current !== null
  ) {
    return requestDirection("backward") === "queued"
      ? "page-turn-queued"
      : "ignored";
  }

  if (activePageIndexRef.current === 0) {
    coverOpenRef.current = false;
    setCoverOpen(false);
    return "cover-closed";
  }

  return requestDirection("backward") === "started"
    ? "page-turn-started"
    : "ignored";
}, [requestDirection]);

const goToPage = useCallback(
  (pageIndex: number) => {
    if (
      turnStateRef.current.phase !== "idle" ||
      pendingIntentRef.current !== null
    ) {
      return;
    }

    const target = Math.max(0, Math.min(lastPageIndex, pageIndex));
    const source = activePageIndexRef.current;

    if (target === source) {
      return;
    }

    if (
      mode === "desktop" &&
      desktopSpreadForPageIndex(target) === desktopSpreadForPageIndex(source)
    ) {
      commitPageIndex(target);
      return;
    }

    beginAutomaticTurn(
      source,
      target,
      target > source ? "forward" : "backward",
    );
  },
  [beginAutomaticTurn, commitPageIndex, lastPageIndex, mode],
);
```

`goToPage` is the absolute Home/End jump path, not an adjacent-direction request. It remains deliberately idle-only: Home and End work normally whenever the book is landed, while a press during the short active settle is ignored instead of being misrepresented as a one-page pending direction. Arrow Left/Right and Page Up/Down use `previous`/`next` and therefore participate in the one latest adjacent-direction buffer.

Replace `rememberPage` with this idle-only version; it must not refer to the removed `activeTurnId`:

```ts
const rememberPage = useCallback(
  (pageIndex: number) => {
    if (
      turnStateRef.current.phase !== "idle" ||
      pendingIntentRef.current !== null
    ) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(lastPageIndex, pageIndex));

    if (nextIndex !== activePageIndexRef.current) {
      commitPageIndex(nextIndex);
    }
  },
  [commitPageIndex, lastPageIndex],
);
```

Add mode/reduced-motion resolution and unmount cleanup around the existing page-count clamping effect:

```ts
// Reuse the existing previousMode ref declared near the other hook refs.
const previousReducedMotion = useRef(reducedMotion);

useLayoutEffect(() => {
  const modeChanged = previousMode.current !== mode;
  const motionChanged = previousReducedMotion.current !== reducedMotion;
  previousMode.current = mode;
  previousReducedMotion.current = reducedMotion;

  if (modeChanged || motionChanged) {
    resolveForLayoutChange();
  }
}, [mode, reducedMotion, resolveForLayoutChange]);

useEffect(() => {
  return () => {
    clearFallback();
    clearPendingLaunch();
    pendingIntentRef.current = null;
    turnStateRef.current = idlePageTurnState;
  };
}, [clearFallback, clearPendingLaunch]);
```

Derive projected availability from the landing destination, not the still-landed page, and return the complete public contract:

```ts
const navigationBaseIndex = projectedBaseIndex();
const canNext =
  coverOpen && adjacentFrom(navigationBaseIndex, "forward") !== null;
const canPrevious =
  coverOpen &&
  (turnState.phase === "idle"
    ? true
    : adjacentFrom(navigationBaseIndex, "backward") !== null);
const activeStep =
  mode === "desktop"
    ? desktopSpreadForPageIndex(activePageIndex)
    : activePageIndex;
const totalSteps = mode === "desktop" ? desktopSpreadCount : pageCount;
const isBusy = turnState.phase !== "idle" || pendingIntent !== null;

return {
  coverOpen,
  openCover,
  activePageIndex,
  activeStep,
  totalSteps,
  turnState,
  pendingIntent,
  isBusy,
  isDragging: turnState.phase === "dragging",
  isSettling: turnState.phase === "settling",
  canPrevious,
  canNext,
  beginDrag,
  updateDrag,
  releaseDrag,
  cancelDrag,
  completeSettle,
  resolveForLayoutChange,
  next,
  previous,
  goToPage,
  rememberPage,
};
```

- [ ] **Step 2: Wire the landed index while retaining the old visual temporarily**

In `Scrapbook.tsx`, import and read the reduced-motion preference:

```ts
import { useReducedMotion } from "./useReducedMotion";

const reducedMotion = useReducedMotion();
const turner = usePageTurner({
  pageCount: pages.length,
  mode,
  reducedMotion,
});
const activeVisualTurn =
  turner.turnState.phase === "idle" ? null : turner.turnState.turn;
const temporarilyVisiblePageIndex = activeVisualTurn
  ? activeVisualTurn.destinationPageIndex
  : turner.activePageIndex;
```

Until Task 3 replaces the visual scene, feed the old leaf its source and the old underlay its destination:

```tsx
<PageTurner
  canNext={turner.canNext}
  canPrevious={turner.canPrevious}
  direction={activeVisualTurn?.direction ?? null}
  enabled={contentOpen && !turner.isBusy}
  isTurning={turner.turnState.phase !== "idle"}
  onNext={requestNext}
  onPrevious={requestPrevious}
  onTurnComplete={() => {
    if (turner.turnState.phase === "settling") {
      turner.completeSettle(turner.turnState.turn.id);
    }
  }}
  outgoingContent={
    activeVisualTurn ? (
      <SpreadRenderer
        activePageIndex={activeVisualTurn.sourcePageIndex}
        decorationLabels={content.recipeDecorationLabels}
        desktopSpreads={desktopSpreads}
        engagementEnabled={false}
        mode={mode}
        onRememberPage={turner.rememberPage}
        pages={pages}
      />
    ) : null
  }
  retainStationaryHalf={mode === "desktop"}
>
  <SpreadRenderer
    activePageIndex={temporarilyVisiblePageIndex}
    decorationLabels={content.recipeDecorationLabels}
    desktopSpreads={desktopSpreads}
    engagementEnabled={contentOpen && !turner.isBusy}
    mode={mode}
    onRememberPage={turner.rememberPage}
    pages={pages}
  />
</PageTurner>
```

Change page-region busy state and controls from `turner.isTurning` to `turner.isBusy`. The temporary JSX above intentionally passes `enabled={contentOpen && !turner.isBusy}` to the old `PageTurner` so the one-frame pending chain cannot expose the obsolete gesture path. Keep controls disabled through their old `isTurning` prop until Task 4 deliberately makes settlement bufferable.

- [ ] **Step 3: Align the temporary CSS animation with the new automatic duration**

In `src/styles/tokens.css`, replace only the old duration token:

```diff
-  --page-turn-duration: 520ms;
+  --page-turn-duration: 370ms;
```

This prevents the interim fallback from removing the old CSS leaf before its animation ends. Task 3 removes the fixed CSS animation entirely.

- [ ] **Step 4: Verify semantic commitment and stale-callback safeguards**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
git diff --check
rg -n "setActivePageIndex|activePageIndexRef\.current" src/scrapbook/usePageTurner.ts
rg -n "turnFallbackDelay|outgoingPageIndex|activeTurnId" src/scrapbook/usePageTurner.ts
```

Expected: build succeeds; the landed index is assigned only by `commitPageIndex`, clamping, or idle `rememberPage`; the obsolete early-commit fields and 800ms fallback are absent.

If a controllable browser is available, click Next and inspect the progress label during the 370ms turn. Expected: progress changes only when the leaf lands. If browser control is unavailable, report this check as unverified.

- [ ] **Step 5: Commit the lifecycle rewrite**

```bash
git add src/scrapbook/usePageTurner.ts src/scrapbook/Scrapbook.tsx src/styles/tokens.css
git commit -m "refactor: model physical page turn lifecycle"
```

Expected: one commit containing the lifecycle, temporary compatibility wiring, and aligned temporary token.

### Task 3: Track direct gestures and render a two-sided physical sheet

**Files:**

- Modify: `src/scrapbook/useSwipeGesture.ts`
- Modify: `src/scrapbook/PageTurner.tsx`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/scrapbook.css`
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Replace the offset-only swipe hook with lifecycle measurements**

Replace `src/scrapbook/useSwipeGesture.ts` with an implementation built around these exact public types and constants:

```ts
import { useCallback, useRef, useState } from "react";
import type { PointerEventHandler } from "react";

import {
  clickSuppressionDistance,
  directionLockDistance,
  progressForDistance,
  shouldCommitSwipe,
} from "./pageTurnMotion";
import type {
  GestureRelease,
  TurnDirection,
  TurnSnapshot,
} from "./pageTurnMotion";

type SwipeGestureOptions = {
  enabled: boolean;
  directManipulationEnabled: boolean;
  onDragStart: (direction: TurnDirection) => TurnSnapshot | null;
  onDragProgress: (turnId: number, progress: number) => void;
  onDragRelease: (release: GestureRelease) => void;
  onDragCancel: (turnId: number, progress: number) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

type PointerSample = { x: number; time: number };

const verticalIntentDistance = 12;
const velocityWindowMs = 120;
const interactiveElementSelector =
  "button, a, dialog, input, textarea, select, [contenteditable='true']";

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(interactiveElementSelector) !== null
  );
}

function directionForDistance(distancePx: number): TurnDirection {
  return distancePx < 0 ? "forward" : "backward";
}

function distanceTowardDirection(
  distancePx: number,
  direction: TurnDirection,
): number {
  return direction === "forward" ? -distancePx : distancePx;
}

function velocityTowardDirection(
  samples: readonly PointerSample[],
  currentX: number,
  currentTime: number,
  direction: TurnDirection,
): number {
  const earliest =
    samples.find((sample) => currentTime - sample.time <= velocityWindowMs) ??
    samples.at(-1);

  if (!earliest || currentTime <= earliest.time) {
    return 0;
  }

  const signedVelocity =
    (currentX - earliest.x) / (currentTime - earliest.time);
  return direction === "forward" ? -signedVelocity : signedVelocity;
}
```

Inside `useSwipeGesture`, use refs rather than React state for every move:

```ts
const pointerId = useRef<number | null>(null);
const startX = useRef(0);
const startY = useRef(0);
const surfaceWidth = useRef(1);
const activeDirection = useRef<TurnDirection | null>(null);
const activeTurnId = useRef<number | null>(null);
const directPointer = useRef(false);
const didDrag = useRef(false);
const suppressNextClick = useRef(false);
const samples = useRef<PointerSample[]>([]);
const latestProgress = useRef(0);
const capturedSurface = useRef<HTMLDivElement | null>(null);
const [isTracking, setIsTracking] = useState(false);
```

Implement these helpers exactly so pointer cancellation cannot leave a half-active drag:

```ts
function resetPointer() {
  pointerId.current = null;
  activeDirection.current = null;
  activeTurnId.current = null;
  directPointer.current = false;
  didDrag.current = false;
  samples.current = [];
  latestProgress.current = 0;
  capturedSurface.current = null;
  setIsTracking(false);
}

function rememberSample(x: number, time: number) {
  samples.current.push({ x, time });
  samples.current = samples.current.filter(
    (sample) => time - sample.time <= velocityWindowMs,
  );
}

function preserveClickSuppression() {
  if (didDrag.current) {
    suppressNextClick.current = true;
  }
}

function releaseCapture(
  element: HTMLDivElement,
  capturedPointerId: number,
) {
  if (element.hasPointerCapture(capturedPointerId)) {
    element.releasePointerCapture(capturedPointerId);
  }
}
```

On pointer down, snapshot whether this gesture may directly manipulate a new leaf. A pointer that starts during settlement is still tracked in intent-only mode:

```ts
const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
  if (
    !event.isPrimary ||
    event.button !== 0 ||
    !enabled ||
    isInteractiveTarget(event.target)
  ) {
    return;
  }

  suppressNextClick.current = false;
  pointerId.current = event.pointerId;
  startX.current = event.clientX;
  startY.current = event.clientY;
  surfaceWidth.current = Math.max(1, event.currentTarget.clientWidth);
  capturedSurface.current = event.currentTarget;
  directPointer.current = directManipulationEnabled;
  samples.current = [{ x: event.clientX, time: event.timeStamp }];
  event.currentTarget.setPointerCapture(event.pointerId);
  setIsTracking(true);
};
```

On move, cancel vertical intent, create a physical turn only after the 8px direction lock, and then report normalized progress:

```ts
const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
  if (pointerId.current !== event.pointerId) {
    return;
  }

  const horizontal = event.clientX - startX.current;
  const vertical = event.clientY - startY.current;
  rememberSample(event.clientX, event.timeStamp);

  if (Math.hypot(horizontal, vertical) > clickSuppressionDistance) {
    didDrag.current = true;
  }

  if (
    Math.abs(vertical) > Math.abs(horizontal) &&
    Math.abs(vertical) > verticalIntentDistance
  ) {
    preserveClickSuppression();

    if (activeTurnId.current !== null) {
      onDragCancel(activeTurnId.current, latestProgress.current);
    }

    resetPointer();
    releaseCapture(event.currentTarget, event.pointerId);
    return;
  }

  if (
    directPointer.current &&
    activeDirection.current === null &&
    Math.abs(horizontal) >= directionLockDistance
  ) {
    const direction = directionForDistance(horizontal);
    const turn = onDragStart(direction);

    if (turn) {
      activeDirection.current = direction;
      activeTurnId.current = turn.id;
    }
  }

  if (activeTurnId.current !== null) {
    const direction = activeDirection.current;

    if (!direction) {
      return;
    }

    const distanceTowardDirectionPx = distanceTowardDirection(
      horizontal,
      direction,
    );
    const progress = progressForDistance(
      distanceTowardDirectionPx,
      surfaceWidth.current,
    );
    latestProgress.current = progress;
    onDragProgress(activeTurnId.current, progress);
  }
};
```

On release, send measurements to the state machine for a direct turn. In intent-only mode, use the same commitment rule before requesting a buffered direction:

```ts
const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
  if (pointerId.current !== event.pointerId) {
    return;
  }

  const horizontal = event.clientX - startX.current;
  const vertical = event.clientY - startY.current;
  const direction =
    activeDirection.current ?? directionForDistance(horizontal || -1);
  const horizontalDominant = Math.abs(horizontal) > Math.abs(vertical);
  const distanceTowardDirectionPx = distanceTowardDirection(
    horizontal,
    direction,
  );
  const velocityTowardDirectionPxPerMs = velocityTowardDirection(
    samples.current,
    event.clientX,
    event.timeStamp,
    direction,
  );
  const progress = progressForDistance(
    distanceTowardDirectionPx,
    surfaceWidth.current,
  );

  if (Math.hypot(horizontal, vertical) > clickSuppressionDistance) {
    didDrag.current = true;
  }
  preserveClickSuppression();

  if (activeTurnId.current !== null) {
    onDragRelease({
      turnId: activeTurnId.current,
      progress,
      distanceTowardDirectionPx,
      velocityTowardDirectionPxPerMs,
      horizontalDominant,
    });
  } else if (
    shouldCommitSwipe({
      distanceTowardDirectionPx,
      velocityTowardDirectionPxPerMs,
      horizontalDominant,
    })
  ) {
    if (direction === "forward") {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  }

  resetPointer();
  releaseCapture(event.currentTarget, event.pointerId);
};
```

Use the same exact cancellation path for `pointercancel` and lost capture. It preserves click suppression, returns a direct leaf to source once, and then clears tracking:

```ts
function cancelTrackedPointer(pointerEventId: number) {
  if (pointerId.current !== pointerEventId) {
    return;
  }

  preserveClickSuppression();

  if (activeTurnId.current !== null) {
    onDragCancel(activeTurnId.current, latestProgress.current);
  }

  resetPointer();
}

const onPointerCancel: PointerEventHandler<HTMLDivElement> = (event) => {
  cancelTrackedPointer(event.pointerId);
};

const onLostPointerCapture: PointerEventHandler<HTMLDivElement> = (event) => {
  cancelTrackedPointer(event.pointerId);
};

function consumeClickSuppression(pointerOriginated: boolean): boolean {
  const shouldSuppress = suppressNextClick.current;
  suppressNextClick.current = false;
  return pointerOriginated && shouldSuppress;
}

const cancelTracking = useCallback(() => {
  const trackedPointerId = pointerId.current;
  const trackedSurface = capturedSurface.current;

  if (trackedPointerId === null) {
    return;
  }

  preserveClickSuppression();

  if (activeTurnId.current !== null) {
    onDragCancel(activeTurnId.current, latestProgress.current);
  }

  resetPointer();

  if (trackedSurface) {
    releaseCapture(trackedSurface, trackedPointerId);
  }
}, [onDragCancel]);
```

Return:

```ts
return {
  isTracking,
  cancelTracking,
  consumeClickSuppression,
  gestureProps: {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
  },
};
```

- [ ] **Step 2: Replace `PageTurner` props with source/destination scene ownership**

Update `PageTurner.tsx` imports and props to this contract:

```ts
import { useCallback, useLayoutEffect, useRef } from "react";
import type { MouseEventHandler, ReactNode } from "react";

import type { ResponsiveMode } from "../layouts/types";
import {
  turnAngleDegrees,
  turnDepth,
  turnEasing,
} from "./pageTurnMotion";
import type {
  GestureRelease,
  PageTurnState,
  TurnDirection,
  TurnSnapshot,
} from "./pageTurnMotion";
import { isInteractiveTarget, useSwipeGesture } from "./useSwipeGesture";

type PageTurnerProps = {
  children: ReactNode;
  sourceContent: ReactNode | null;
  destinationContent: ReactNode | null;
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

Add refs for the scene and all independently animated layers:

```ts
const surfaceRef = useRef<HTMLDivElement>(null);
const leafRef = useRef<HTMLDivElement>(null);
const castShadowRef = useRef<HTMLSpanElement>(null);
const edgeRef = useRef<HTMLSpanElement>(null);
const shadingRef = useRef<HTMLSpanElement>(null);
const gutterShadeRef = useRef<HTMLSpanElement>(null);
const destinationRef = useRef<HTMLDivElement>(null);
const visualProgress = useRef(0);
const gestureDirection = useRef<TurnDirection | null>(null);
const visualFrame = useRef<number | null>(null);
const pendingVisual = useRef<{
  progress: number;
  direction: TurnDirection;
} | null>(null);
const runningAnimations = useRef<Animation[]>([]);
```

Use one imperative progress writer for direct drag. It must never set React state:

```ts
const applyProgress = useCallback(
  (progress: number, direction: TurnDirection) => {
    visualProgress.current = progress;

    if (reducedMotion) {
      return;
    }

    const leaf = leafRef.current;
    const castShadow = castShadowRef.current;
    const edge = edgeRef.current;
    const shading = shadingRef.current;
    const gutterShade = gutterShadeRef.current;
    const angle = turnAngleDegrees({ mode, direction, progress });
    const depth = turnDepth(progress);

    if (leaf) {
      leaf.style.transform = `rotateY(${angle}deg)`;
    }
    if (castShadow) {
      castShadow.style.opacity = `${depth * 0.48}`;
      castShadow.style.transform = `scaleX(${0.24 + depth * 0.76})`;
    }
    if (edge) {
      edge.style.opacity = `${depth * 0.82}`;
    }
    if (shading) {
      shading.style.opacity = `${0.16 + depth * 0.46}`;
      shading.style.transform =
        `translateZ(0.4px) scaleX(${0.78 + depth * 0.22})`;
    }
    if (gutterShade) {
      gutterShade.style.opacity = `${depth * 0.42}`;
      gutterShade.style.transform = `scaleX(${0.35 + depth * 0.65})`;
    }
  },
  [mode, reducedMotion],
);
```

Schedule at most one style write per animation frame, even when the browser emits several pointer events between paints:

```ts
const scheduleProgress = useCallback(
  (progress: number, direction: TurnDirection) => {
    visualProgress.current = progress;
    pendingVisual.current = { progress, direction };

    if (visualFrame.current !== null) {
      return;
    }

    visualFrame.current = window.requestAnimationFrame(() => {
      visualFrame.current = null;
      const nextVisual = pendingVisual.current;
      pendingVisual.current = null;

      if (nextVisual) {
        applyProgress(nextVisual.progress, nextVisual.direction);
      }
    });
  },
  [applyProgress],
);

useLayoutEffect(() => {
  return () => {
    if (visualFrame.current !== null) {
      window.cancelAnimationFrame(visualFrame.current);
    }
    runningAnimations.current.forEach((animation) => animation.cancel());
    visualFrame.current = null;
    pendingVisual.current = null;
    runningAnimations.current = [];
  };
}, []);
```

Connect the new gesture hook. Direct manipulation is allowed only when there is no active turn; settlement remains trackable in intent-only mode:

```ts
const {
  isTracking,
  cancelTracking,
  consumeClickSuppression,
  gestureProps,
} =
  useSwipeGesture({
    enabled,
    directManipulationEnabled: turnState.phase === "idle",
    onDragStart: (direction) => {
      const turn = onDragStart(direction);

      if (turn) {
        gestureDirection.current = direction;
      }

      return turn;
    },
    onDragProgress: (turnId, progress) => {
      visualProgress.current = progress;
      onDragProgress(turnId, progress);

      const direction =
        turnState.phase === "idle"
          ? gestureDirection.current
          : turnState.turn.direction;

      if (direction) {
        scheduleProgress(progress, direction);
      }
    },
    onDragRelease,
    onDragCancel,
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });
```

On the render immediately following `beginDrag`, apply the latest stored progress so the first few pointer pixels are not lost while React mounts the leaf:

```ts
useLayoutEffect(() => {
  if (turnState.phase === "dragging") {
    scheduleProgress(visualProgress.current, turnState.turn.direction);
  }
}, [scheduleProgress, turnState]);
```

- [ ] **Step 3: Settle from the exact current angle with WAAPI**

Add a settlement effect to `PageTurner.tsx`. Cancel all owned animations before starting a new ID; only the leaf animation completion may resolve the logical turn:

```ts
useLayoutEffect(() => {
  if (visualFrame.current !== null) {
    window.cancelAnimationFrame(visualFrame.current);
    visualFrame.current = null;
    pendingVisual.current = null;
  }

  runningAnimations.current.forEach((animation) => animation.cancel());
  runningAnimations.current = [];

  if (turnState.phase !== "settling") {
    return;
  }

  const { turn, settleTarget, startProgress, durationMs } = turnState;
  const destinationProgress = settleTarget === "destination" ? 1 : 0;
  let completed = false;

  const complete = () => {
    if (!completed) {
      completed = true;
      onTurnComplete(turn.id);
    }
  };

  if (reducedMotion) {
    if (settleTarget === "source") {
      const frame = window.requestAnimationFrame(complete);
      return () => window.cancelAnimationFrame(frame);
    }

    const destination = destinationRef.current;

    if (!destination) {
      complete();
      return;
    }

    const animation = destination.animate(
      [
        { opacity: 0, transform: "translateY(1px) scale(0.996)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: durationMs, easing: "ease-out", fill: "forwards" },
    );
    runningAnimations.current = [animation];
    animation.finished.then(complete).catch(() => undefined);
    return () => animation.cancel();
  }

  if (Math.abs(destinationProgress - startProgress) < 0.001) {
    applyProgress(destinationProgress, turn.direction);
    const frame = window.requestAnimationFrame(complete);
    return () => window.cancelAnimationFrame(frame);
  }

  const leaf = leafRef.current;
  const castShadow = castShadowRef.current;
  const edge = edgeRef.current;
  const shading = shadingRef.current;
  const gutterShade = gutterShadeRef.current;

  if (!leaf || !castShadow || !edge || !shading || !gutterShade) {
    complete();
    return;
  }

  const progressStops = [startProgress];
  const crossesMidpoint =
    (startProgress < 0.5 && destinationProgress > 0.5) ||
    (startProgress > 0.5 && destinationProgress < 0.5);

  if (crossesMidpoint) {
    progressStops.push(0.5);
  }
  progressStops.push(destinationProgress);

  const offsetFor = (progress: number) => {
    const distance = Math.abs(destinationProgress - startProgress);
    return distance === 0
      ? 1
      : Math.abs(progress - startProgress) / distance;
  };
  const leafFrames = progressStops.map((progress) => ({
    offset: offsetFor(progress),
    transform: `rotateY(${turnAngleDegrees({
      mode,
      direction: turn.direction,
      progress,
    })}deg)`,
  }));
  const depthFrames = progressStops.map((progress) => ({
    offset: offsetFor(progress),
    opacity: turnDepth(progress) * 0.48,
    transform: `scaleX(${0.24 + turnDepth(progress) * 0.76})`,
  }));
  const edgeFrames = progressStops.map((progress) => ({
    offset: offsetFor(progress),
    opacity: turnDepth(progress) * 0.82,
  }));
  const shadingFrames = progressStops.map((progress) => ({
    offset: offsetFor(progress),
    opacity: 0.16 + turnDepth(progress) * 0.46,
    transform:
      `translateZ(0.4px) scaleX(${0.78 + turnDepth(progress) * 0.22})`,
  }));
  const gutterFrames = progressStops.map((progress) => ({
    offset: offsetFor(progress),
    opacity: turnDepth(progress) * 0.42,
    transform: `scaleX(${0.35 + turnDepth(progress) * 0.65})`,
  }));
  const options: KeyframeAnimationOptions = {
    duration: durationMs,
    easing: turnEasing,
    fill: "forwards",
  };
  const leafAnimation = leaf.animate(leafFrames, options);
  const shadowAnimation = castShadow.animate(depthFrames, options);
  const edgeAnimation = edge.animate(edgeFrames, options);
  const shadingAnimation = shading.animate(shadingFrames, options);
  const gutterAnimation = gutterShade.animate(gutterFrames, options);
  runningAnimations.current = [
    leafAnimation,
    shadowAnimation,
    edgeAnimation,
    shadingAnimation,
    gutterAnimation,
  ];
  leafAnimation.finished.then(complete).catch(() => undefined);

  return () => {
    runningAnimations.current.forEach((animation) => animation.cancel());
    runningAnimations.current = [];
  };
}, [applyProgress, mode, onTurnComplete, reducedMotion, turnState]);
```

Do not resolve on `animationcancel`; cancellation is cleanup, not success. The hook's ID-checked fallback remains the second completion path.

- [ ] **Step 4: Render the correct physical faces**

Replace the old `PageTurner` JSX with this layer order. The landed semantic content remains the only accessible page:

```tsx
const activeTurn = turnState.phase === "idle" ? null : turnState.turn;
const direction = activeTurn?.direction;
const mobileBackward = mode === "mobile" && direction === "backward";
const leafFrontContent = mobileBackward
  ? destinationContent
  : sourceContent;
const leafBackContent =
  mode === "desktop" ? destinationContent : sourceContent;

return (
  <div
    className="page-turner"
    data-busy={isBusy || undefined}
    data-mode={mode}
    data-reduced-motion={reducedMotion || undefined}
    data-tracking={isTracking || undefined}
    data-turn={direction}
    onClick={onSurfaceClick}
    onClickCapture={onSurfaceClickCapture}
    ref={surfaceRef}
    {...gestureProps}
  >
    <div
      aria-hidden={isBusy || undefined}
      className="page-turner__content"
      inert={isBusy}
    >
      {children}
    </div>

    {activeTurn ? (
      <div aria-hidden="true" className="page-turner__scene" inert>
        <div
          className="page-turner__destination"
          ref={destinationRef}
        >
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
      </div>
    ) : null}
  </div>
);
```

Keep the existing click-suppression handler. Replace the old edge-tap calculation with the approved mobile band, and allow taps during settlement while still rejecting them during a live drag:

```ts
if (
  !enabled ||
  turnState.phase === "dragging" ||
  isInteractiveTarget(event.target)
) {
  return;
}

const desktop = mode === "desktop";
const horizontalInset = desktop
  ? Math.max(44, bounds.width * 0.07)
  : Math.min(64, Math.max(52, bounds.width * 0.11));
```

- [ ] **Step 5: Give `Scrapbook` separate landed, source, and destination renderers**

Remove `temporarilyVisiblePageIndex` and the old `outgoingContent` wiring. The normal child always renders `turner.activePageIndex`. Create inert visual renderers only for the active snapshot:

```tsx
const visualTurn =
  turner.turnState.phase === "idle" ? null : turner.turnState.turn;

const sourceContent = visualTurn ? (
  <SpreadRenderer
    activePageIndex={visualTurn.sourcePageIndex}
    decorationLabels={content.recipeDecorationLabels}
    desktopSpreads={desktopSpreads}
    engagementEnabled={false}
    mode={mode}
    onRememberPage={turner.rememberPage}
    pages={pages}
  />
) : null;

const destinationContent = visualTurn ? (
  <SpreadRenderer
    activePageIndex={visualTurn.destinationPageIndex}
    decorationLabels={content.recipeDecorationLabels}
    desktopSpreads={desktopSpreads}
    engagementEnabled={false}
    mode={mode}
    onRememberPage={turner.rememberPage}
    pages={pages}
  />
) : null;
```

Pass the full physical contract:

```tsx
<PageTurner
  canNext={turner.canNext}
  canPrevious={turner.canPrevious}
  destinationContent={destinationContent}
  enabled={contentOpen}
  isBusy={turner.isBusy}
  mode={mode}
  onDragCancel={turner.cancelDrag}
  onDragProgress={turner.updateDrag}
  onDragRelease={turner.releaseDrag}
  onDragStart={turner.beginDrag}
  onLayoutChange={turner.resolveForLayoutChange}
  onNext={requestNext}
  onPrevious={requestPrevious}
  onTurnComplete={turner.completeSettle}
  reducedMotion={reducedMotion}
  sourceContent={sourceContent}
  turnState={turner.turnState}
>
  <SpreadRenderer
    activePageIndex={turner.activePageIndex}
    decorationLabels={content.recipeDecorationLabels}
    desktopSpreads={desktopSpreads}
    engagementEnabled={contentOpen && !turner.isBusy}
    mode={mode}
    onRememberPage={turner.rememberPage}
    pages={pages}
  />
</PageTurner>
```

Use `turner.isBusy` for page-region `aria-busy`. Keep the region inert only when the cover is closed; `PageTurner` owns content inertness during a turn.

- [ ] **Step 6: Replace the canned animation with the stable physical scene CSS**

In `src/styles/scrapbook.css`, remove:

- the `--drag-offset` translation/transition;
- `turn-forward` and `turn-backward` keyframes;
- fixed leaf opacity fading;
- `release-stationary-page` animation and its keyframes;
- old `.page-turner__outgoing-composition` cropping selectors.

Replace the page-turn block with these rules:

```css
  .scrapbook-page-region[aria-busy="true"] {
    overflow: visible;
  }

  .page-turner {
    position: relative;
    perspective: 1600px;
    perspective-origin: 50% 48%;
    transform-style: preserve-3d;
    touch-action: pan-y pinch-zoom;
    user-select: none;
  }

  .page-turner__content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  .page-turner__scene,
  .page-turner__destination,
  .page-turner__turning-leaf,
  .page-turner__leaf-face,
  .page-turner__visual-composition {
    width: 100%;
    height: 100%;
  }

  .page-turner__scene,
  .page-turner__destination,
  .page-turner__turning-leaf,
  .page-turner__leaf-face,
  .page-turner__cast-shadow,
  .page-turner__gutter-shade {
    position: absolute;
  }

  .page-turner__scene,
  .page-turner__destination,
  .page-turner__leaf-face {
    inset: 0;
  }

  .page-turner__scene {
    z-index: 20;
    pointer-events: none;
    transform-style: preserve-3d;
  }

  .page-turner__destination {
    z-index: 10;
    overflow: hidden;
  }

  .page-turner__stationary-source {
    display: none;
  }

  .page-turner__turning-leaf {
    z-index: 40;
    pointer-events: none;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .page-turner__leaf-face {
    overflow: hidden;
    background: var(--color-paper);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .page-turner__leaf-face--back {
    background:
      linear-gradient(
        90deg,
        rgb(65 40 24 / 18%),
        rgb(250 238 214 / 90%) 45%,
        rgb(255 250 235 / 32%) 78%,
        rgb(66 41 25 / 12%)
      ),
      var(--color-paper);
    transform: rotateY(180deg);
  }

  .page-turner[data-mode="mobile"]
    .page-turner__leaf-face--back
    .page-turner__visual-composition {
    opacity: 0.1;
    transform: scaleX(-1);
    mix-blend-mode: multiply;
  }

  .page-turner__leaf-shading,
  .page-turner__leaf-edge {
    position: absolute;
    inset-block: 0;
    z-index: 3;
    pointer-events: none;
  }

  .page-turner__leaf-shading {
    inset-inline: 0;
    background: linear-gradient(
      90deg,
      rgb(50 29 16 / 18%),
      transparent 16% 72%,
      rgb(255 248 228 / 18%) 88%,
      rgb(66 39 22 / 12%)
    );
    mix-blend-mode: multiply;
    opacity: 0.16;
    transform: translateZ(0.4px) scaleX(0.78);
    transform-origin: center;
    will-change: opacity, transform;
  }

  .page-turner__leaf-edge {
    right: 0;
    width: clamp(0.18rem, 0.8cqw, 0.55rem);
    background: linear-gradient(
      90deg,
      rgb(83 54 31 / 26%),
      rgb(255 248 225 / 82%),
      rgb(74 45 26 / 18%)
    );
    box-shadow: -0.25rem 0 0.45rem rgb(53 31 17 / 18%);
    opacity: 0;
    transform: translateZ(0.8px);
  }

  .page-turner__cast-shadow {
    top: 1%;
    bottom: 1%;
    left: 1%;
    z-index: 38;
    width: 48%;
    background: linear-gradient(
      90deg,
      rgb(39 21 12 / 36%),
      rgb(39 21 12 / 14%) 38%,
      transparent
    );
    filter: blur(0.22rem);
    opacity: 0;
    pointer-events: none;
    transform-origin: left center;
    will-change: opacity, transform;
  }

  .page-turner__gutter-shade {
    top: 1%;
    bottom: 1%;
    left: 50%;
    z-index: 39;
    width: clamp(0.8rem, 2.2cqw, 1.8rem);
    background: linear-gradient(
      90deg,
      rgb(43 25 14 / 30%),
      rgb(64 39 22 / 14%) 38%,
      transparent
    );
    filter: blur(0.12rem);
    opacity: 0;
    pointer-events: none;
    transform: scaleX(0.35);
    transform-origin: left center;
    will-change: opacity, transform;
  }

  .page-turner[data-mode="mobile"] .page-turner__gutter-shade {
    right: auto;
    left: 0;
  }

  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__gutter-shade {
    right: 50%;
    left: auto;
    background: linear-gradient(
      270deg,
      rgb(43 25 14 / 30%),
      rgb(64 39 22 / 14%) 38%,
      transparent
    );
    transform-origin: right center;
  }

  .page-turner[data-mode="mobile"] .page-turner__turning-leaf {
    inset: 0;
    transform-origin: left center;
  }

  .page-turner[data-mode="desktop"] .page-turner__turning-leaf,
  .page-turner[data-mode="desktop"] .page-turner__stationary-source {
    top: 0;
    bottom: 0;
    width: 50%;
  }

  .page-turner[data-mode="desktop"] .page-turner__stationary-source {
    position: absolute;
    z-index: 35;
    display: block;
    overflow: hidden;
  }

  .page-turner[data-mode="desktop"]
    .page-turner__stationary-source
    .page-turner__visual-composition,
  .page-turner[data-mode="desktop"]
    .page-turner__turning-leaf
    .page-turner__visual-composition {
    width: 200%;
  }

  .page-turner[data-mode="desktop"][data-turn="forward"]
    .page-turner__turning-leaf {
    right: 0;
    left: 50%;
    transform-origin: left center;
  }

  .page-turner[data-mode="desktop"][data-turn="forward"]
    .page-turner__stationary-source {
    right: 50%;
    left: 0;
  }

  .page-turner[data-mode="desktop"][data-turn="forward"]
    .page-turner__leaf-face--front
    .page-turner__visual-composition {
    transform: translateX(-50%);
  }

  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__turning-leaf {
    right: 50%;
    left: 0;
    transform-origin: right center;
  }

  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__stationary-source {
    right: 0;
    left: 50%;
  }

  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__stationary-source
    .page-turner__visual-composition,
  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__leaf-face--back
    .page-turner__visual-composition {
    transform: translateX(-50%);
  }

  .page-turner[data-mode="desktop"][data-turn="backward"]
    .page-turner__leaf-edge {
    right: auto;
    left: 0;
    box-shadow: 0.25rem 0 0.45rem rgb(53 31 17 / 18%);
  }
```

The two small `filter: blur()` declarations are static on modest gradient layers; do not animate either filter. If device profiling shows they are expensive, replace them with wider unblurred gradients rather than adding canvas or a library.

Correct the mobile-backward destination visibility selector to remain visible in reduced-motion mode:

```css
  .page-turner[data-mode="mobile"][data-turn="backward"]
    .page-turner__destination {
    visibility: hidden;
  }

  .page-turner[data-reduced-motion][data-turn="backward"]
    .page-turner__destination {
    visibility: visible;
  }
```

Remove the temporary `--page-turn-duration` token from `tokens.css`; retain `--page-turn-ease` for visual documentation even though the WAAPI path imports the matching typed constant.

- [ ] **Step 7: Build and inspect the new source invariants**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
git diff --check

if rg -n \
  'drag-offset|@keyframes turn-forward|@keyframes turn-backward|opacity:[[:space:]]*0\.08|release-stationary-page' \
  src/scrapbook src/styles; then
  exit 1
else
  echo "obsolete flat turn removed"
fi

rg -n \
  'swipeDistanceThreshold = 44|flickDistanceThreshold = 24|flickVelocityThreshold = 0\.45|distanceTowardDirectionPx|canCommit|page-turner__gutter-shade|Math\.min\(64, Math\.max\(52' \
  src/scrapbook
```

Expected: production build succeeds; old slide/fade/keyframe behavior is absent; approved gesture and edge values are present.

- [ ] **Step 8: Perform a focused physical-turn browser check**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

At 1440 × 900, slowly drag forward and backward. Expected: the moving half follows the pointer; the stationary half remains; target content appears on the back/underlay; the fold band, paper edge, cast shadow, and gutter shade strengthen toward mid-turn and recede toward either landing; no whole-spread slide, blank reverse, fade-away, or second leaf appears.

During the same check, lock a direction and then reverse across the pointer-down position before release. Expected: progress returns to zero and the originally locked direction does not commit. At the final spread, pull forward and release. Expected: the source sheet visibly tugs, settles back, and neither the logical page nor pending intent changes.

At 390 × 844, slowly drag forward and backward. Expected: the full page follows the pointer around the retained left spine, passes over the blue cover sliver, and stays recognizably rectangular/paper-like through the turn. Below-threshold drags return to the same page.

If browser control is unavailable, report both checks as unverified rather than inferring them from the build.

- [ ] **Step 9: Commit the physical gesture and rendering path**

```bash
git add \
  src/scrapbook/useSwipeGesture.ts \
  src/scrapbook/PageTurner.tsx \
  src/scrapbook/Scrapbook.tsx \
  src/styles/scrapbook.css \
  src/styles/tokens.css
git commit -m "feat: render gesture-driven scrapbook page turns"
```

Expected: one feature commit with no content, recipe, dependency, or metadata changes.

### Task 4: Expose rapid buffered input and harden interruption behavior

**Files:**

- Modify: `src/components/ScrapbookControls.tsx`
- Modify: `src/scrapbook/PageTurner.tsx`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/scrapbook.css`

- [ ] **Step 1: Keep controls bufferable while settling**

Replace `ScrapbookControlsProps` and unavailability derivation with:

```ts
type ScrapbookControlsProps = {
  activeStep: number;
  totalSteps: number;
  canPrevious: boolean;
  canNext: boolean;
  isBusy: boolean;
  interactionLocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const previousUnavailable = !canPrevious || interactionLocked;
const nextUnavailable = !canNext || interactionLocked;
const canBuffer = isBusy && !interactionLocked;
```

Use `isBusy` for the nav's `aria-busy` and progress styling. Use `canBuffer` as `data-buffering` on both buttons. Keep `aria-disabled` tied only to the derived unavailable values:

```tsx
<nav
  aria-busy={isBusy || undefined}
  aria-label="Scrapbook pages"
  className="scrapbook-controls"
  data-turning={isBusy || undefined}
>
```

```tsx
data-buffering={canBuffer || undefined}
data-turning={isBusy || undefined}
```

The button click guards remain `if (!previousUnavailable)` and `if (!nextUnavailable)`. This sends a settling click to the same latest-wins state path rather than disabling it.

In `Scrapbook.tsx`, pass:

```tsx
isBusy={turner.isBusy}
interactionLocked={turner.isDragging}
```

- [ ] **Step 2: Make buffered controls look available, not broken**

Replace the current wait-cursor rule in `scrapbook.css`:

```css
  .scrapbook-control[data-turning]:not([data-boundary]) {
    opacity: 0.72;
  }

  .scrapbook-control[data-buffering]:not([data-boundary]) {
    cursor: pointer;
    opacity: 0.88;
  }

  .scrapbook-control[aria-disabled="true"]:not([data-boundary]) {
    cursor: wait;
    opacity: 0.58;
  }
```

- [ ] **Step 3: Resolve material geometry changes safely**

In `PageTurner.tsx`, add a `ResizeObserver` that establishes its first size as the baseline and only resolves a live turn for a material dimension change of at least 4%. This avoids treating small mobile-browser-chrome movement as an orientation change:

```ts
useLayoutEffect(() => {
  const surface = surfaceRef.current;

  if (!surface) {
    return;
  }

  let previousSize: { width: number; height: number } | null = null;
  const observer = new ResizeObserver(([entry]) => {
    if (!entry) {
      return;
    }

    const nextSize = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    };

    if (previousSize) {
      const widthChange =
        Math.abs(nextSize.width - previousSize.width) /
        Math.max(1, previousSize.width);
      const heightChange =
        Math.abs(nextSize.height - previousSize.height) /
        Math.max(1, previousSize.height);

      if (Math.max(widthChange, heightChange) >= 0.04) {
        cancelTracking();
        onLayoutChange();
      }
    }

    previousSize = nextSize;
  });

  observer.observe(surface);
  return () => observer.disconnect();
}, [cancelTracking, onLayoutChange]);
```

Mode changes remain resolved synchronously by `usePageTurner`; this observer covers same-mode orientation and material book-size changes.

Also release pointer tracking when the responsive mode or reduced-motion context changes even if the rendered book dimensions happen to remain similar:

```ts
const previousInteractionContext = useRef({ mode, reducedMotion });

useLayoutEffect(() => {
  const previous = previousInteractionContext.current;
  previousInteractionContext.current = { mode, reducedMotion };

  if (
    previous.mode !== mode ||
    previous.reducedMotion !== reducedMotion
  ) {
    cancelTracking();
  }
}, [cancelTracking, mode, reducedMotion]);
```

- [ ] **Step 4: Preserve continuous busy semantics across a chain**

In `Scrapbook.tsx`, confirm all three places use `turner.isBusy`, not only `turnState.phase !== "idle"`:

```tsx
aria-busy={turner.isBusy || undefined}
```

```tsx
engagementEnabled={contentOpen && !turner.isBusy}
```

```tsx
<ScrapbookControls isBusy={turner.isBusy} ... />
```

This keeps notes inert and `aria-busy` present during the one animation frame between a landing and its pending turn.

- [ ] **Step 5: Build and exercise rapid-input boundaries**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
git diff --check
rg -n "pendingIntent|requestAnimationFrame|fallbackDelayMs|interactionLocked|data-buffering" \
  src/scrapbook src/components src/styles/scrapbook.css
```

In a browser, verify these exact sequences:

1. Opening page: start Forward, then swipe Back during settlement. Expected: return to opening page; the cover does not close.
2. Start Forward, then Back, then Forward before landing. Expected: one active leaf; latest pending Forward wins.
3. Final page/spread: Forward is rejected and does not create a pending turn.
4. During a drag, controls are unavailable; during settlement, a valid control queues once.
5. Cancel or lose pointer capture. Expected: return to source, clear the leaf, and restore interaction.

If browser automation is unavailable, keep these results explicitly unverified.

- [ ] **Step 6: Commit rapid buffering and interruption safeguards**

```bash
git add \
  src/components/ScrapbookControls.tsx \
  src/scrapbook/PageTurner.tsx \
  src/scrapbook/Scrapbook.tsx \
  src/styles/scrapbook.css
git commit -m "feat: buffer rapid scrapbook navigation"
```

### Task 5: Finish accessibility and reduced-motion behavior

**Files:**

- Modify: `src/styles/accessibility.css`
- Modify: `src/styles/scrapbook.css`
- Review: `src/scrapbook/PageTurner.tsx`
- Review: `src/scrapbook/Scrapbook.tsx`

- [ ] **Step 1: Remove obsolete reduced-motion page keyframes**

In `src/styles/accessibility.css`, delete the old `.page-turner__turning-leaf`, `.page-turner__stationary-outgoing`, `reduced-page-departure`, and `reduced-stationary-departure` rules. Replace them inside `@media (prefers-reduced-motion: reduce)` with:

```css
  .page-turner[data-reduced-motion] {
    perspective: none;
  }

  .page-turner[data-reduced-motion] .page-turner__turning-leaf,
  .page-turner[data-reduced-motion] .page-turner__stationary-source,
  .page-turner[data-reduced-motion] .page-turner__cast-shadow {
    visibility: hidden;
  }

  .page-turner[data-reduced-motion] .page-turner__destination {
    visibility: visible;
    opacity: 0;
    transform: translateY(1px) scale(0.996);
    will-change: opacity, transform;
  }
```

The JavaScript WAAPI branch owns the approved 140ms fade/depth transition. The global 1ms CSS-animation rule remains for unrelated decorative motion and does not shorten WAAPI.

- [ ] **Step 2: Audit transient semantics and focusability**

Confirm the exact JSX attributes remain:

```tsx
<div aria-hidden="true" className="page-turner__scene" inert>
```

```tsx
<div
  aria-hidden={isBusy || undefined}
  className="page-turner__content"
  inert={isBusy}
>
```

Confirm source and destination `SpreadRenderer` copies use `engagementEnabled={false}`. Do not put `aria-live` on drag progress; the existing progress bookmark remains the landed-page announcement.

- [ ] **Step 3: Preserve zoom and dialog interaction guards**

Run:

```bash
if rg -n \
  'user-scalable|maximum-scale|touch-action:[[:space:]]*none' \
  index.html src; then
  exit 1
else
  echo "zoom accessibility guard passed"
fi

rg -n \
  'touch-action: pan-y pinch-zoom|touch-action: manipulation|overflow-y: auto' \
  src/styles/scrapbook.css src/styles/accessibility.css
```

Expected: no restrictive viewport/touch rules; the page surface retains horizontal custom gestures and pinch zoom; the reading view retains internal scrolling.

- [ ] **Step 4: Build and manually verify accessibility paths**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
git diff --check
```

At desktop and mobile sizes:

- Tab during a turn. Expected: focus cannot enter destination, stationary, front, or back visual copies.
- Open a note, close with Escape, and close with its button. Expected: the page does not turn; focus returns to the trigger.
- Enable reduced motion and perform button, keyboard, edge, and swipe navigation. Expected: no 3D scrub; committed changes use about 140ms fade/depth; a rapid second input is still remembered.
- Inspect progress during a cancelled drag and a committed turn. Expected: no announcement on cancel; one landed-page update on completion.

If no controllable browser is available, report each browser-only result as unverified.

- [ ] **Step 5: Commit accessibility completion**

```bash
git add src/styles/accessibility.css src/styles/scrapbook.css
git commit -m "fix: preserve page turn accessibility"
```

Expected: only accessibility/reduced-motion CSS changes are committed here. If source fixes were required by the audit, stage those exact files and explain them in the commit body rather than hiding them.

### Task 6: Complete the cross-device physical-scrapbook audit

**Files:**

- Review all files changed since baseline `c6ceacd`
- Modify only files with an observed failure

- [ ] **Step 1: Run the authoritative build and scope audit**

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
node --version
npm --version
npm run build
git diff --check c6ceacd..HEAD
git diff --name-only c6ceacd..HEAD
git diff c6ceacd..HEAD -- \
  src/content/scrapbook.ts \
  src/layouts/recipes \
  package.json \
  package-lock.json \
  index.html
```

Expected: Node `v22.12.0`, npm `10.9.0`, TypeScript clean, Vite successful, and no diff in protected content/recipe/dependency/metadata files.

- [ ] **Step 2: Start the browser review surface**

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/`. Do not substitute source inspection for a visual pass.

- [ ] **Step 3: Verify desktop at 1440 × 900**

Check:

- forward leaf: outgoing right half pivots around the centre spine, outgoing left stays stationary, target-left appears on the reverse, and target-right is underneath;
- backward leaf mirrors the construction correctly;
- no blank back, opacity dissolve, whole-spread slide, moving gutter, or second flying leaf; fold, edge, cast-shadow, and gutter-depth cues vary continuously with progress;
- slow pointer drag tracks continuously and below-threshold release returns cleanly;
- reversing across the pointer-down position after direction lock returns progress toward zero and cannot commit the locked direction;
- a forward pull at the final spread produces one snap-back-only leaf and never queues or commits; opening-spread backward retains its normal cover-close behavior;
- edge taps, Back/Next buttons, Arrow keys, and Page Up/Down remain functional and bufferable; Home and End remain functional from idle and are deliberately ignored during an active settle;
- a second valid action during settlement is remembered without an idle delay.

- [ ] **Step 4: Verify portrait mobile at 390 × 844 and 320 × 568**

At each size check:

- slow 43px horizontal drag cancels; slow 44px drag commits;
- fast 23px flick cancels; fast 24px flick at approximately 0.45px/ms commits;
- vertical-dominant movement cancels;
- forward turns around the retained left spine and passes over the blue cover sliver;
- backward brings the previous sheet back from that same spine;
- a tap about 50px from either rendered page edge navigates; a tap about 70px from the edge does not;
- note/button interactions do not start a page drag;
- forward, then buffered back returns to the source;
- forward, back, forward before landing honors the latest forward direction;
- direction lock followed by reversal across the touch-down position cancels instead of committing the original direction;
- a forward pull on the final page visibly tugs and settles the sheet back without a page or announcement change;
- no native document scrolling or accidental double-tap zoom occurs at default scale.

- [ ] **Step 5: Verify landscape, breakpoint changes, and interruption**

At 844 × 390, confirm the complete book and controls remain visible and transient paper never creates document overflow.

Resize 899 × 700 ↔ 900 × 700:

- idle resize preserves the logical memory;
- resize during an uncommitted drag returns to source;
- resize during a committed settle lands the destination exactly once;
- no leaf, timer, pending intent, or `aria-busy` state remains stuck.

- [ ] **Step 6: Inspect live invariants**

During a turn run:

```js
document.querySelectorAll(".page-turner__turning-leaf").length;
```

Expected: exactly `1`; after landing/cancellation: `0`.

Inspect transient semantics:

```js
[...document.querySelectorAll(
  ".page-turner__destination, .page-turner__stationary-source, .page-turner__turning-leaf",
)].map((element) => ({
  className: element.className,
  inert: element.closest("[inert]") !== null,
  ariaHidden: element.closest('[aria-hidden="true"]') !== null,
}));
```

Expected: every visual layer is inside an inert, `aria-hidden="true"` scene.

Check default-scale viewport containment:

```js
const root = document.documentElement;
({
  scrollWidth: [root.scrollWidth, root.clientWidth],
  scrollHeight: [root.scrollHeight, root.clientHeight],
  scrollPosition: [scrollX, scrollY],
  visualScale: visualViewport?.scale,
});
```

Expected: dimensions match and scroll position is `[0, 0]` at scale 1.

- [ ] **Step 7: Verify real-touch and reduced-motion behavior**

On a touch-capable browser/device check:

- rapid repeated swipes;
- two-finger pinch increases `visualViewport.scale`;
- double tap does not zoom;
- OS/pointer cancellation returns to source;
- rotation during drag and committed settlement resolves once.

With reduced motion enabled, repeat rapid swipe, buttons, keyboard, edge taps, boundaries, and note/dialog checks. Expected: same state behavior, approximately 140ms fade/depth, no 3D scrub, and no cooldown.

If genuine multi-touch, pointer cancellation, or reduced-motion emulation is unavailable, list those checks as unverified.

- [ ] **Step 8: Run final obsolete-behavior and worktree checks**

```bash
if rg -n \
  'const turnFallbackDelay = 800|enabled: enabled && !isTurning|opacity:[[:space:]]*0\.08|page-turner__leaf-face--back" />|--page-turn-duration:[[:space:]]*520ms' \
  src/scrapbook src/styles; then
  exit 1
else
  echo "obsolete page-turn behavior removed"
fi

if rg -n \
  'user-scalable|maximum-scale|touch-action:[[:space:]]*none' \
  index.html src; then
  exit 1
else
  echo "zoom accessibility guard passed"
fi

git status --short
git log --oneline --decorate -10
```

Expected: obsolete lock/fade/blank-back rules are absent; zoom safeguards pass; the worktree is clean.

- [ ] **Step 9: Commit only observed audit fixes**

If the audit found the example mobile clipping defect, make the smallest focused correction in `src/styles/scrapbook.css`, repeat the affected browser check and full build, then commit:

```bash
git add src/styles/scrapbook.css
git commit -m "fix: resolve mobile page turn clipping"
```

For a different observed defect, stage only its named affected files and use a message that states that defect. If no defect was found, do not create an empty or speculative cleanup commit.

## Completion criteria

Implementation is complete only when:

- dragging visibly controls a real two-sided page around the correct spine;
- commit/cancel thresholds and mobile edge bands match the approved values;
- logical content and progress update only on landing;
- one latest pending adjacent direction works across swipe, edge, control, Arrow-key, and Page Up/Down input; idle-only Home/End jumps retain their existing absolute destination semantics;
- boundaries never queue a cover close or out-of-range page;
- reduced motion, pinch zoom, dialogs, retained cover, no-scroll mobile behavior, and resize cleanup remain intact;
- TypeScript and Vite build successfully under Node 22.12.0;
- every unavailable browser/device check is explicitly reported rather than inferred;
- no unit tests were created or run; and
- the worktree contains no unrelated changes.

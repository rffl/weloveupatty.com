# iOS Safari Forward Page-Turn Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make automatic mobile Next turns paint and animate reliably on iOS Safari while leaving Back, finger-driven swipes, desktop behavior, page stacking, and timing unchanged.

**Architecture:** Carry the already-known turn input source into the settling snapshot so rendering can distinguish automatic turns from gesture settlements. In `PageTurner`, initialize only a fresh automatic mobile-forward leaf at its explicit identity transform, allow one real paint boundary through two animation frames, then start the existing Web Animations API sequence with complete cleanup for stale callbacks.

**Tech Stack:** React 19, TypeScript 6, Web Animations API, `requestAnimationFrame`, Vite 6

---

### Task 1: Preserve turn input source in settling state

**Files:**
- Modify: `src/scrapbook/pageTurnMotion.ts`
- Modify: `src/scrapbook/usePageTurner.ts`

- [ ] **Step 1: Add input-source metadata to the settling state**

In `PageTurnState`, add the existing `TurnInputSource` value without changing navigation semantics:

```ts
  | Readonly<{
      phase: "settling";
      turn: TurnSnapshot;
      settleTarget: TurnSettleTarget;
      startProgress: number;
      durationMs: number;
      inputSource: TurnInputSource;
    }>;
```

- [ ] **Step 2: Publish the metadata from both turn entry paths**

Add the explicit source to the automatic state publication:

```ts
publishTurnState({
  phase: "settling",
  turn,
  settleTarget: "destination",
  startProgress: 0,
  durationMs,
  inputSource: "automatic",
});
```

Add the existing `source` argument to gesture settlement publication:

```ts
publishTurnState({
  phase: "settling",
  turn: current.turn,
  settleTarget: resolvedTarget,
  startProgress,
  durationMs,
  inputSource: source,
});
```

- [ ] **Step 3: Compile the metadata change**

Run: `npm run build`

Expected: TypeScript reports no missing settling-state constructors and Vite completes successfully.

- [ ] **Step 4: Commit the state metadata**

```bash
git add src/scrapbook/pageTurnMotion.ts src/scrapbook/usePageTurner.ts
git commit -m "refactor: retain page turn input source"
```

### Task 2: Warm the fresh iOS forward leaf before WAAPI playback

**Files:**
- Modify: `src/scrapbook/PageTurner.tsx`

- [ ] **Step 1: Identify only the affected animation path**

Inside the non-reduced-motion settling effect, derive the gate from frozen turn state:

```ts
const needsPaintWarmup =
  mode === "mobile" &&
  turn.direction === "forward" &&
  turnState.inputSource === "automatic" &&
  settleTarget === "destination" &&
  startProgress === 0;
```

This deliberately excludes automatic Back, desktop turns, gesture releases, and cancelled gestures.

- [ ] **Step 2: Extract the existing WAAPI creation into a guarded starter**

Declare local lifecycle state and preserve the current animation frames, easing, and duration:

```ts
let firstPaintFrame: number | null = null;
let secondPaintFrame: number | null = null;
let disposed = false;

const startAnimations = () => {
  if (disposed) {
    return;
  }

  const options: KeyframeAnimationOptions = {
    duration: durationMs,
    easing: turnEasing,
    fill: needsPaintWarmup ? "both" : "forwards",
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
};
```

- [ ] **Step 3: Initialize and paint the automatic mobile-forward leaf**

Use two frames so one browser paint occurs between initialization and animation creation:

```ts
if (needsPaintWarmup) {
  applyProgress(startProgress, turn.direction);
  firstPaintFrame = window.requestAnimationFrame(() => {
    firstPaintFrame = null;
    secondPaintFrame = window.requestAnimationFrame(() => {
      secondPaintFrame = null;
      startAnimations();
    });
  });
} else {
  startAnimations();
}
```

- [ ] **Step 4: Cancel every pending or running animation resource**

Replace the normal-path cleanup with:

```ts
return () => {
  disposed = true;

  if (firstPaintFrame !== null) {
    window.cancelAnimationFrame(firstPaintFrame);
  }
  if (secondPaintFrame !== null) {
    window.cancelAnimationFrame(secondPaintFrame);
  }

  runningAnimations.current.forEach((animation) => animation.cancel());
  runningAnimations.current = [];
};
```

- [ ] **Step 5: Verify compilation and lifecycle invariants**

Run:

```bash
npm run build
git diff --check
rg -n "inputSource|needsPaintWarmup|firstPaintFrame|secondPaintFrame|fill:" src/scrapbook
```

Expected: the production build succeeds; diff check is silent; the warm-up gate exists only in `PageTurner`; both scheduled frames have matching cancellation paths; the existing `680ms` desktop and `480ms` mobile durations remain unchanged.

- [ ] **Step 6: Commit the Safari fix**

```bash
git add src/scrapbook/PageTurner.tsx
git commit -m "fix: paint mobile forward leaf before turning"
```

### Task 3: Final static review and handoff

**Files:**
- Review: `src/scrapbook/PageTurner.tsx`
- Review: `src/scrapbook/pageTurnMotion.ts`
- Review: `src/scrapbook/usePageTurner.ts`

- [ ] **Step 1: Inspect the full implementation range**

Run:

```bash
git diff --check f2772e7..HEAD
git diff f2772e7..HEAD -- src/scrapbook/PageTurner.tsx src/scrapbook/pageTurnMotion.ts src/scrapbook/usePageTurner.ts
```

Expected: no whitespace errors and no changes to angle calculations, navigation boundaries, stacking CSS, or approved duration constants.

- [ ] **Step 2: Run the final production build**

Run: `npm run build`

Expected: TypeScript and Vite both exit successfully.

- [ ] **Step 3: Confirm a clean worktree**

Run: `git status --short`

Expected: no output.

- [ ] **Step 4: Hand off real-device checks**

On iOS Safari with Reduce Motion disabled, review automatic Next and Back, opening-to-first-contribution, middle pages with retained history, rapid alternating taps, and a finger-driven swipe settlement. No unit tests are added, per the project requirement.


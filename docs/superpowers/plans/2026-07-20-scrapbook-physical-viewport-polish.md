# Patty Scrapbook Physical Viewport Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center every enlarged note, preserve the physically opened cover beside the pages, and recompose the complete scrapbook onto a taller, viewport-locked mobile canvas without sacrificing its handmade character or pinch-zoom accessibility.

**Architecture:** Keep the existing four-phase cover state machine, native modal dialog, responsive page engine, and 15 typed layout recipes. The change is CSS-led: explicit top-layer centering, a lower stacking layer for the settled cover, safe-area-aware mobile geometry, and mobile-only placement revisions; `Cover.tsx` changes only to make its visible open state inert and to settle both normal-motion and reduced-motion transitions safely.

**Tech Stack:** React 19, Vite 6, TypeScript 6, Tailwind CSS v4, handcrafted CSS, native `<dialog>`, native Pointer Events, npm under Node 22.12.0.

---

## Guardrails and file map

The user explicitly prohibited unit tests. Do not add a test runner, test dependency, test script, snapshot, or unit-test file. Every task uses static inspection, `git diff --check`, the existing TypeScript/Vite production build, and focused browser interaction checks.

Preserve the approved illustrated-handmade “Melbourne Memory Table” direction. Do not change `src/content/scrapbook.ts`, photo placeholders, dependencies, routing, hosting, or deployment. Do not shrink the desktop spread, create a conventional mobile feed, add a second mobile DOM tree, stretch photos, or replace the current page-turning engine.

Files changed by this plan:

- `src/styles/accessibility.css` — center `ReadingView`, retain internal note scrolling, and define dialog touch behavior.
- `src/components/Cover.tsx` — make the retained open cover inert/hidden, keep unavailable transitions untabbable, and accept the reduced-motion opacity transition as a settlement signal.
- `src/styles/scrapbook.css` — retain the settled cover, implement reduced-motion open-cover presentation, lock the experience surface, size the taller safe-area-aware mobile book, and recompose opening/closing pages.
- `src/styles/index.css` — prevent the document/root from becoming a second scroll surface.
- `src/layouts/recipes/mapFoldout.ts`
- `src/layouts/recipes/tapedPolaroids.ts`
- `src/layouts/recipes/foldedLetter.ts`
- `src/layouts/recipes/airmailEnvelope.ts`
- `src/layouts/recipes/tornNotebook.ts`
- `src/layouts/recipes/photoboothStrip.ts`
- `src/layouts/recipes/tramTicket.ts`
- `src/layouts/recipes/coffeeReceipt.ts`
- `src/layouts/recipes/postcard.ts`
- `src/layouts/recipes/pressedFlower.ts`
- `src/layouts/recipes/filmNegative.ts`
- `src/layouts/recipes/stickyNotes.ts`
- `src/layouts/recipes/diaryEntry.ts`
- `src/layouts/recipes/eventTicket.ts`
- `src/layouts/recipes/finalLoveLetter.ts` — mobile-only art direction for the new `0.54 : 1` page; all desktop placements remain byte-for-byte unchanged.

Reference the approved design contract before each review pass:

- `docs/superpowers/specs/2026-07-20-scrapbook-physical-viewport-polish-design.md`

### Task 1: Center the enlarged reading view

**Files:**

- Modify: `src/styles/accessibility.css` (`.reading-view`, `.reading-view__content`)

- [ ] **Step 1: Confirm the reset is the cause and capture the current dialog rules**

Run:

```bash
rg -n "margin: 0|\.reading-view|overflow-y|overscroll-behavior" src/styles/index.css src/styles/accessibility.css
```

Expected: the base reset contains `margin: 0`, `.reading-view` has no explicit centering margin, and `.reading-view__content` already owns `overflow-y: auto` plus `overscroll-behavior: contain`.

- [ ] **Step 2: Give the native dialog explicit viewport centering and deliberate touch behavior**

Apply this exact change in `src/styles/accessibility.css`:

```diff
   .reading-view {
+    position: fixed;
+    inset: 0;
     width: min(92vw, 42rem);
     max-width: none;
     max-height: 88dvh;
     padding: 0;
+    margin: auto;
     overflow: visible;
     color: var(--color-ink);
     background: transparent;
     border: 0;
+    touch-action: manipulation;
   }
```

Keep the current rotated paper, max heights, close-button focus, native modal behavior, and internal overflow. Add the following declaration to the existing `.reading-view__content` block so a long letter can still be scrolled and deliberately pinch-zoomed without re-enabling double-tap zoom:

```diff
   .reading-view__content {
     min-height: 0;
     padding: clamp(0.35rem, 2vw, 1rem) clamp(1.35rem, 6vw, 3.75rem)
       clamp(1.75rem, 6vw, 3.5rem);
     overflow-y: auto;
     overscroll-behavior: contain;
     cursor: text;
+    touch-action: pan-y pinch-zoom;
     user-select: text;
   }
```

- [ ] **Step 3: Run formatting and production-build checks**

Run:

```bash
git diff --check
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: `git diff --check` prints nothing; nvm reports Node `v22.12.0`; TypeScript completes without errors; Vite produces a successful `dist/` build.

- [ ] **Step 4: Verify the dialog at desktop and mobile viewport sizes**

Run the site through the in-app browser at 1440 × 900 and 390 × 844. Open any contribution note. Because the placeholder copy is intentionally short, temporarily create an overflow case in the live DOM without changing source files:

```js
const message = document.querySelector(".reading-view__message");

if (message instanceof HTMLElement) {
  message.textContent = `${message.textContent}\n\n`.repeat(12);
}
```

Then confirm `.reading-view__content.scrollHeight > .reading-view__content.clientHeight` and scroll that internal region to its end. Reloading the page discards this inspection-only mutation.

Expected at both sizes: the paper's bounding box is centered horizontally and vertically within normal visual tolerance; the close button receives focus; Escape, backdrop click, and the close button dismiss it; long content scrolls inside `.reading-view__content`; the scrapbook behind it does not move; focus returns to the note trigger.

If the in-app browser has no controllable tab, record this step as “browser verification unavailable” rather than treating the build as visual proof.

- [ ] **Step 5: Commit the centered-dialog change**

```bash
git add src/styles/accessibility.css
git commit -m "fix: center scrapbook reading view"
```

Expected: one commit containing only `src/styles/accessibility.css`.

### Task 2: Retain the opened cover as a physical, inert layer

**Files:**

- Modify: `src/components/Cover.tsx` (`finishTransition`, cover section, cover button)
- Modify: `src/styles/scrapbook.css` (`.scrapbook-cover[data-phase="open"]`)
- Modify: `src/styles/accessibility.css` (reduced-motion cover rules)

- [ ] **Step 1: Broaden the transition settlement guard without weakening it**

In `src/components/Cover.tsx`, replace the property-name branch in `finishTransition` with the following exact condition:

```diff
   const finishTransition: TransitionEventHandler<HTMLElement> = (event) => {
     if (
       event.currentTarget !== event.target ||
-      event.propertyName !== "transform" ||
+      (event.propertyName !== "transform" &&
+        event.propertyName !== "opacity") ||
       (phase !== "opening" && phase !== "closing") ||
       settlingPhase.current !== phase
     ) {
       return;
     }
```

Normal motion still settles on `transform`; reduced motion will settle on its only transitioned property, `opacity`. The existing 900 ms/220 ms fallback remains unchanged and still resolves interrupted transitions.

- [ ] **Step 2: Make the retained open cover decorative and every unavailable phase untabbable**

Keep the section exposed during its brief opening/closing transition, but make its settled open state decorative. Apply this exact section change:

```diff
     <section
       aria-hidden={phase === "open" || undefined}
       className="scrapbook-cover"
       data-phase={phase}
+      inert={phase === "open"}
       onTransitionEnd={finishTransition}
     >
```

```diff
-        tabIndex={phase === "open" ? -1 : 0}
+        tabIndex={unavailable ? -1 : 0}
```

Expected semantics: only the fully closed cover exposes an actionable “Open scrapbook” button. The opening/closing button is disabled and untabbable; after settlement, `settleCoverTransition` has already blurred it and the retained cover becomes inert plus `aria-hidden`.

- [ ] **Step 3: Keep the settled normal-motion cover visible behind the pages**

Replace the existing open-phase rule in `src/styles/scrapbook.css`:

```diff
   .scrapbook-cover[data-phase="open"] {
-    visibility: hidden;
+    z-index: 5;
+    visibility: visible;
     pointer-events: none;
   }
```

Do not change the `rotateY(-168deg)` opening/open transform. During animation the cover retains `z-index: 70`; after settlement it drops behind `.scrapbook-page-region` (`z-index: 10`). The unchanged viewport clipping crops the part turned beyond the table edge, producing the approved broad left-side cover on desktop and a small cloth edge on mobile.

- [ ] **Step 4: Retain a static offset cover under reduced motion**

Replace the reduced-motion cover rules in `src/styles/accessibility.css` with this exact block:

```css
  .scrapbook-cover {
    opacity: 1;
    transform: translateX(0) scale(1) !important;
    transition-property: opacity !important;
    transition-duration: 140ms !important;
    transition-timing-function: ease-out !important;
  }

  .scrapbook-cover[data-phase="opening"],
  .scrapbook-cover[data-phase="open"] {
    opacity: 0.88;
    transform: translateX(-100%) scale(0.996) !important;
  }
```

This intentionally jumps to a static opened offset and only fades depth for 140 ms. It does not animate a large rotation or translation. Closing jumps back to the closed offset and settles via the reverse opacity transition.

- [ ] **Step 5: Run source-level safeguards and the production build**

Run:

```bash
git diff --check
rg -n -A4 'scrapbook-cover\[data-phase="open"\]' src/styles/scrapbook.css src/styles/accessibility.css
rg -n 'inert=|tabIndex=|propertyName' src/components/Cover.tsx
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: no diff whitespace errors; the normal-motion settled cover block reads `z-index: 5` and `visibility: visible`; `Cover.tsx` contains the inert and untabbable behavior; production build succeeds.

- [ ] **Step 6: Verify normal and reduced-motion cover behavior**

At 1440 × 900, open the book and wait beyond the 900 ms fallback. Confirm that a broad blue cover remains cropped on the left, the page spread keeps its previous dimensions, and all page/note/control interactions still work. Navigate Back from the opening page and confirm the retained cover closes before its button regains focus.

At 390 × 844, repeat the sequence and confirm that a narrow blue cloth edge remains visible without covering the page or controls. In a reduced-motion emulation, confirm there is no large 3D cover swing, a static left offset remains visible after opening, and both open and close states settle.

Expected accessibility inspection while open: the cover section is `aria-hidden`, inert, untabbable, and pointer-inert. If browser automation is unavailable, report these visual/interaction checks as unverified.

- [ ] **Step 7: Commit the retained-cover change**

```bash
git add src/components/Cover.tsx src/styles/scrapbook.css src/styles/accessibility.css
git commit -m "feat: retain opened scrapbook cover"
```

Expected: one focused cover-state commit.

### Task 3: Install the taller, safe-area-aware mobile shell and gesture contract

**Files:**

- Modify: `src/styles/index.css` (root scroll containment)
- Modify: `src/styles/scrapbook.css` (experience containment, touch action, mobile geometry, short-height fallback)

- [ ] **Step 1: Make the document/root a fixed-size viewport surface**

Replace the base root/body block in `src/styles/index.css` with:

```css
  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    min-width: 320px;
    margin: 0;
    overflow: hidden;
    overscroll-behavior: none;
  }

  body {
    min-height: 100dvh;
  }

  #root {
    height: 100dvh;
  }
```

This removes the old `min-height: 100%`/body-only overflow split. Do not change the viewport meta tag in `index.html`.

- [ ] **Step 2: Lock the experience at default scale while preserving deliberate zoom**

In `src/styles/scrapbook.css`, update the shared interaction rules exactly as follows:

```diff
   .scrapbook-experience {
     position: relative;
     display: grid;
     width: 100%;
     height: 100dvh;
-    min-height: 100dvh;
+    min-height: 0;
     place-items: center;
     overflow: hidden;
+    overscroll-behavior: none;
     padding: 1rem;
+    touch-action: manipulation;
   }
```

```diff
   .page-turner {
     position: relative;
-    touch-action: pan-y;
+    touch-action: pan-y pinch-zoom;
     user-select: none;
   }
```

Add this rule beside the page-turner interaction rules:

```css
  .openable-note,
  .scrapbook-control {
    touch-action: manipulation;
  }
```

`manipulation` suppresses accidental double-tap zoom but still permits pinch zoom; `pan-y pinch-zoom` reserves one-finger horizontal movement for the existing Pointer Events swipe while retaining two-finger zoom. Do not use `touch-action: none` anywhere.

- [ ] **Step 3: Replace the portrait-mobile frame geometry**

At the beginning of the existing `@media (width < 900px)` block in `src/styles/scrapbook.css`, replace the experience, stage, and book rules with:

```css
    .scrapbook-experience {
      --scrapbook-safe-top: max(
        0.4rem,
        env(safe-area-inset-top, 0px)
      );
      --scrapbook-safe-right: max(
        0.45rem,
        env(safe-area-inset-right, 0px)
      );
      --scrapbook-safe-bottom: max(
        0.4rem,
        env(safe-area-inset-bottom, 0px)
      );
      --scrapbook-safe-left: max(
        0.45rem,
        env(safe-area-inset-left, 0px)
      );

      padding: var(--scrapbook-safe-top) var(--scrapbook-safe-right)
        var(--scrapbook-safe-bottom) var(--scrapbook-safe-left);
    }

    .scrapbook-stage {
      --controls-track: 2.9rem;
      --mobile-page-ratio: 0.54;

      width: min(
        94vw,
        100%,
        calc(
          (
              100dvh - 4.75rem - var(--scrapbook-safe-top) -
                var(--scrapbook-safe-bottom)
            ) * var(--mobile-page-ratio)
        ),
        27rem
      );
      gap: clamp(0.38rem, 1vh, 0.62rem);
    }

    .scrapbook-book {
      aspect-ratio: var(--mobile-page-ratio) / 1;
      padding: 2.2%;
      border-radius: 0.42rem 0.65rem 0.65rem 0.42rem;
    }
```

The safe-area terms appear both as parent padding and in the height-derived width because the explicit stage width must fit inside the parent's reduced content height. At 390 × 844 the width cap produces roughly a 679 px page (about 80% of viewport height); at 320 × 568 the height cap produces roughly a 479 px page (about 84%).

- [ ] **Step 4: Keep short mobile viewports height-constrained without changing page shape**

Replace the stage rule inside `@media (width < 900px) and (height < 520px)` with:

```css
    .scrapbook-stage {
      width: min(
        92vw,
        100%,
        calc(
          (
              100dvh - 4.5rem - var(--scrapbook-safe-top) -
                var(--scrapbook-safe-bottom)
            ) * var(--mobile-page-ratio)
        ),
        27rem
      );
    }
```

Do not restore a `0.72` aspect ratio in landscape: the re-authored recipe heights in Tasks 4–6 assume the physical `0.54 : 1` page. This short-height rule only changes the size constraint so the page and controls fit.

- [ ] **Step 5: Prove the CSS avoids prohibited zoom and scroll locks**

Run:

```bash
git diff --check
if rg -n 'user-scalable|maximum-scale|touch-action:[[:space:]]*none' index.html src; then
  exit 1
else
  echo "pinch zoom remains available"
fi
rg -n '0\.54|safe-area-inset|overscroll-behavior|pinch-zoom|touch-action: manipulation' src/styles/index.css src/styles/scrapbook.css src/styles/accessibility.css
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: the prohibited-pattern check prints only `pinch zoom remains available`; the required selectors are found; build succeeds.

- [ ] **Step 6: Verify shell geometry before recomposing individual pages**

Inspect the closed cover and opening page at 390 × 844, 320 × 568, and a short landscape viewport such as 844 × 390.

Expected: the entire book and controls fit without document `scrollHeight` exceeding `clientHeight` at default `1×`; no vertical rubber-band space is revealed; page/cover aspect is `0.54 : 1`; horizontal swipe, edge taps, and controls still navigate; a double tap does not zoom; a two-finger pinch remains available. Recipe collisions are expected at this intermediate checkpoint and are fixed in Tasks 4–6.

- [ ] **Step 7: Commit the mobile shell change**

```bash
git add src/styles/index.css src/styles/scrapbook.css
git commit -m "feat: use taller mobile scrapbook canvas"
```

Expected: one shell/gesture commit, with no recipe or content changes.

### Task 4: Recompose mobile contributions 1–5

**Files:**

- Modify: `src/layouts/recipes/mapFoldout.ts`
- Modify: `src/layouts/recipes/tapedPolaroids.ts`
- Modify: `src/layouts/recipes/foldedLetter.ts`
- Modify: `src/layouts/recipes/airmailEnvelope.ts`
- Modify: `src/layouts/recipes/tornNotebook.ts`

The physical-height conversion is `0.72 / 0.54 = 0.75`. Keep every desktop placement, width, horizontal offset, rotation, z-index, photo variant, note variant, and decoration kind unchanged. Apply only the exact mobile `top`/`bottom`/`height` substitutions below; message pieces remain intentionally a little taller than a strict 75% conversion for legibility.

- [ ] **Step 1: Recompose the map foldout**

Apply these exact substitutions in `src/layouts/recipes/mapFoldout.ts`:

```diff
-          top: "17%",
+          top: "15%",
           left: "7%",
           width: "61%",
-          height: "30%",
+          height: "23%",
```

```diff
           top: "11%",
           right: "5%",
           width: "36%",
-          height: "23%",
+          height: "17%",
```

```diff
           right: "6%",
           bottom: "8%",
           width: "44%",
-          height: "24%",
+          height: "18%",
```

```diff
-        top: "48%",
+        top: "46%",
         left: "9%",
         width: "75%",
-        height: "29%",
+        height: "24%",
```

```diff
-          top: "37%",
+          top: "34%",
           right: "4%",
           width: "32%",
-          height: "17%",
+          height: "13%",
```

```diff
-          top: "15%",
+          top: "13%",
           left: "24%",
```

```diff
-          bottom: "5%",
+          bottom: "4%",
           left: "8%",
```

Expected composition: upper photos bridge into the map, the map bridges into the notebook note, the note ends near 70%, and the lower photo begins near 74% without obscuring the note trigger.

- [ ] **Step 2: Recompose the taped Polaroids**

Apply these exact substitutions in `src/layouts/recipes/tapedPolaroids.ts`:

```diff
-          top: "16%",
+          top: "17%",
           left: "6%",
           width: "65%",
-          height: "34%",
+          height: "26%",
```

```diff
-          top: "25%",
+          top: "34%",
           right: "5%",
           width: "49%",
-          height: "29%",
+          height: "22%",
```

```diff
-        bottom: "8%",
+        bottom: "7%",
         left: "8%",
         width: "82%",
-        height: "34%",
+        height: "29%",
```

```diff
-          top: "13%",
+          top: "15%",
           left: "24%",
```

```diff
-          top: "23%",
+          top: "32%",
           right: "13%",
```

Expected composition: the two Polaroids overlap from roughly 34–43%, the second ends near 56%, and the letter begins near 64%, leaving a deliberate visual seam.

- [ ] **Step 3: Recompose the folded letter**

Apply these exact substitutions in `src/layouts/recipes/foldedLetter.ts`:

```diff
-          top: "14%",
+          top: "15%",
           right: "6%",
           width: "54%",
-          height: "28%",
+          height: "21%",
```

```diff
-        top: "37%",
+        top: "42%",
         left: "7%",
         width: "85%",
-        height: "53%",
+        height: "42%",
```

```diff
-          top: "35%",
+          top: "40%",
           left: "38%",
```

```diff
           right: "3%",
-          bottom: "4%",
+          bottom: "9%",
           width: "24%",
-          height: "11%",
+          height: "9%",
```

Expected composition: the snapshot ends near 36%, the letter begins at 42%, tape crosses its top edge, and the stamp overlaps only the lower corner around 82–84%.

- [ ] **Step 4: Recompose the airmail envelope**

Apply these exact substitutions in `src/layouts/recipes/airmailEnvelope.ts`:

```diff
           top: "16%",
           left: "5%",
           width: "61%",
-          height: "29%",
+          height: "22%",
```

```diff
-          top: "27%",
+          top: "34%",
           right: "5%",
           width: "43%",
-          height: "24%",
+          height: "18%",
```

```diff
-        bottom: "8%",
+        bottom: "7%",
         left: "7%",
         width: "84%",
-        height: "42%",
+        height: "34%",
```

```diff
-          top: "11%",
+          top: "12%",
           left: "55%",
           width: "23%",
-          height: "11%",
+          height: "9%",
```

Expected composition: the photographs overlap from roughly 34–38%, the second ends near 52%, and the envelope begins near 59%; the stamp still overlaps the upper postcard.

- [ ] **Step 5: Recompose the torn notebook**

Apply these exact substitutions in `src/layouts/recipes/tornNotebook.ts`:

```diff
-          top: "15%",
+          top: "16%",
           right: "5%",
           width: "56%",
-          height: "30%",
+          height: "23%",
```

```diff
-          top: "26%",
+          top: "34%",
           left: "6%",
           width: "43%",
-          height: "23%",
+          height: "18%",
```

```diff
-        bottom: "8%",
+        bottom: "7%",
         left: "9%",
         width: "82%",
-        height: "42%",
+        height: "34%",
```

```diff
-          top: "13%",
+          top: "14%",
           right: "18%",
```

Expected composition: photographs overlap from roughly 34–39%, the second ends near 52%, the notebook begins near 59%, and the bottom doodle stays over the notebook margin rather than the note text.

- [ ] **Step 6: Check scope, build, and inspect the five pages**

Run:

```bash
git diff --check
git diff --stat
git diff -- src/layouts/recipes/mapFoldout.ts src/layouts/recipes/tapedPolaroids.ts src/layouts/recipes/foldedLetter.ts src/layouts/recipes/airmailEnvelope.ts src/layouts/recipes/tornNotebook.ts
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: only `mobile` placement values differ in these five recipes; every desktop object is unchanged; build succeeds.

At both 390 × 844 and 320 × 568, inspect Friend 01 through Friend 05. Expected: every name and note trigger is readable/reachable, each photo preserves its intended proportions, no essential piece is clipped, and overlaps match the composition notes above. A two-line replacement name must remain readable above the photo layers.

- [ ] **Step 7: Commit contributions 1–5**

```bash
git add src/layouts/recipes/mapFoldout.ts src/layouts/recipes/tapedPolaroids.ts src/layouts/recipes/foldedLetter.ts src/layouts/recipes/airmailEnvelope.ts src/layouts/recipes/tornNotebook.ts
git commit -m "feat: recompose first mobile scrapbook pages"
```

Expected: one mobile-recipe commit containing exactly five files.

### Task 5: Recompose mobile contributions 6–10

**Files:**

- Modify: `src/layouts/recipes/photoboothStrip.ts`
- Modify: `src/layouts/recipes/tramTicket.ts`
- Modify: `src/layouts/recipes/coffeeReceipt.ts`
- Modify: `src/layouts/recipes/postcard.ts`
- Modify: `src/layouts/recipes/pressedFlower.ts`

Continue the same `0.75` physical-height conversion and keep all desktop placement data untouched. The existing book-relative type rules in `src/styles/scrapbook.css` and container compaction in `src/styles/layouts.css` already scale names, note previews, labels, and placeholders from the actual page width; do not add a second typography system.

- [ ] **Step 1: Recompose the photobooth strip**

Apply these exact substitutions in `src/layouts/recipes/photoboothStrip.ts`:

```diff
-    mobile: { top: "5%", left: "8%", width: "61%", rotate: -2, z: 8 },
+    mobile: { top: "4%", left: "8%", width: "61%", rotate: -2, z: 8 },
```

```diff
-          top: "15%",
+          top: "13%",
           left: "5%",
           width: "35%",
-          height: "22%",
+          height: "17%",
```

```diff
           top: "18%",
           left: "33%",
           width: "35%",
-          height: "22%",
+          height: "17%",
```

```diff
-          top: "15%",
+          top: "23%",
           right: "4%",
           width: "35%",
-          height: "22%",
+          height: "17%",
```

```diff
         bottom: "9%",
         left: "8%",
         width: "84%",
-        height: "49%",
+        height: "37%",
```

```diff
-          top: "38%",
+          top: "39%",
           left: "23%",
           width: "54%",
-          height: "5%",
+          height: "4%",
```

Expected composition: the three booth frames cascade instead of forming a perfect row; the third frame meets the film strip; the message begins near 54%; the bottom doodle lightly overlaps the paper footer.

- [ ] **Step 2: Recompose the tram ticket**

Apply these exact substitutions in `src/layouts/recipes/tramTicket.ts`:

```diff
-    mobile: { top: "5%", left: "7%", width: "60%", rotate: -3, z: 8 },
+    mobile: { top: "4%", left: "7%", width: "60%", rotate: -3, z: 8 },
```

```diff
-          top: "16%",
+          top: "18%",
           right: "5%",
           width: "62%",
-          height: "30%",
+          height: "23%",
```

```diff
-          top: "28%",
+          top: "36%",
           left: "5%",
           width: "46%",
-          height: "26%",
+          height: "20%",
```

```diff
         bottom: "8%",
         left: "8%",
         width: "84%",
-        height: "39%",
+        height: "30%",
```

```diff
-          top: "11%",
+          top: "13%",
           right: "3%",
           width: "43%",
-          height: "10%",
+          height: "8%",
```

Expected composition: the ticket crosses into the first snapshot without touching a two-line name, the photos overlap from roughly 36–41%, and the note starts near 62%.

- [ ] **Step 3: Recompose the coffee receipt**

Apply these exact substitutions in `src/layouts/recipes/coffeeReceipt.ts`:

```diff
-    mobile: { top: "5%", right: "7%", width: "61%", rotate: 3, z: 8 },
+    mobile: { top: "4%", right: "7%", width: "61%", rotate: 3, z: 8 },
```

```diff
-          top: "15%",
+          top: "14%",
           left: "5%",
           width: "59%",
-          height: "31%",
+          height: "23%",
```

```diff
-          top: "27%",
+          top: "30%",
           right: "5%",
           width: "45%",
-          height: "24%",
+          height: "18%",
```

```diff
         bottom: "7%",
         left: "16%",
         width: "68%",
-        height: "47%",
+        height: "35%",
```

```diff
-          top: "47%",
+          top: "49%",
           left: "3%",
           width: "29%",
-          height: "25%",
+          height: "19%",
```

```diff
-          bottom: "50%",
+          bottom: "39%",
           left: "40%",
```

Expected composition: the photos overlap from 30–37%, the physical receipt sits partly beneath the note, and the relocated tape attaches the note's upper edge near 61%.

- [ ] **Step 4: Recompose the postcard**

Apply these exact substitutions in `src/layouts/recipes/postcard.ts`:

```diff
-    mobile: { top: "5%", left: "7%", width: "61%", rotate: -3, z: 8 },
+    mobile: { top: "4%", left: "7%", width: "61%", rotate: -3, z: 8 },
```

```diff
-          top: "15%",
+          top: "17%",
           left: "5%",
           width: "73%",
-          height: "35%",
+          height: "27%",
```

```diff
-        bottom: "9%",
+        bottom: "11%",
         right: "6%",
         width: "84%",
-        height: "43%",
+        height: "33%",
```

```diff
           top: "11%",
           right: "4%",
           width: "26%",
-          height: "12%",
+          height: "9%",
```

Expected composition: the image ends near 44%, the postcard note begins near 56%, and the doodle remains in the lower paper margin.

- [ ] **Step 5: Recompose the pressed-flower letter**

Apply these exact substitutions in `src/layouts/recipes/pressedFlower.ts`:

```diff
-    mobile: { top: "5%", right: "7%", width: "60%", rotate: 2, z: 8 },
+    mobile: { top: "4%", right: "7%", width: "60%", rotate: 2, z: 8 },
```

```diff
-          top: "15%",
+          top: "16%",
           left: "6%",
           width: "60%",
-          height: "31%",
+          height: "23%",
```

```diff
-          top: "28%",
+          top: "34%",
           right: "5%",
           width: "44%",
-          height: "24%",
+          height: "18%",
```

```diff
-        bottom: "8%",
+        bottom: "9%",
         left: "9%",
         width: "82%",
-        height: "40%",
+        height: "31%",
```

```diff
           top: "8%",
           left: "57%",
           width: "16%",
-          height: "15%",
+          height: "11%",
```

```diff
           bottom: "2%",
           right: "2%",
           width: "18%",
-          height: "16%",
+          height: "12%",
```

```diff
-          top: "13%",
+          top: "14%",
           left: "22%",
```

Expected composition: the snapshots overlap from roughly 34–39%, the letter begins near 60%, and both flowers overlap paper edges without covering the note trigger.

- [ ] **Step 6: Check scope, build, and inspect the five pages**

Run:

```bash
git diff --check
git diff -- src/layouts/recipes/photoboothStrip.ts src/layouts/recipes/tramTicket.ts src/layouts/recipes/coffeeReceipt.ts src/layouts/recipes/postcard.ts src/layouts/recipes/pressedFlower.ts
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: only mobile placement values differ; all five desktop recipes are unchanged; build succeeds.

At both 390 × 844 and 320 × 568, inspect Friend 06 through Friend 10. Confirm the deliberately irregular photo cascades remain visible, all captions stay associated with their photos, note triggers remain comfortably larger than 44 × 44 CSS pixels, and decorations do not mask names or note hints.

- [ ] **Step 7: Commit contributions 6–10**

```bash
git add src/layouts/recipes/photoboothStrip.ts src/layouts/recipes/tramTicket.ts src/layouts/recipes/coffeeReceipt.ts src/layouts/recipes/postcard.ts src/layouts/recipes/pressedFlower.ts
git commit -m "feat: recompose middle mobile scrapbook pages"
```

Expected: one mobile-recipe commit containing exactly five files.
### Task 6: Recompose mobile contributions 11–15 and the bookend pages

**Files:**

- Modify: `src/layouts/recipes/filmNegative.ts`
- Modify: `src/layouts/recipes/stickyNotes.ts`
- Modify: `src/layouts/recipes/diaryEntry.ts`
- Modify: `src/layouts/recipes/eventTicket.ts`
- Modify: `src/layouts/recipes/finalLoveLetter.ts`
- Modify: `src/styles/scrapbook.css` (mobile opening/closing composition inside `@media (width < 900px)`)

- [ ] **Step 1: Recompose the film-negative page**

Apply these exact substitutions in `src/layouts/recipes/filmNegative.ts`:

```diff
-    mobile: { top: "5%", left: "7%", width: "61%", rotate: -2, z: 9 },
+    mobile: { top: "4%", left: "7%", width: "61%", rotate: -2, z: 9 },
```

```diff
-        mobile: { top: "16%", left: "4%", width: "49%", height: "24%", rotate: -5, z: 5 },
+        mobile: { top: "13%", left: "4%", width: "49%", height: "18%", rotate: -5, z: 5 },
```

```diff
-        mobile: { top: "18%", right: "4%", width: "49%", height: "24%", rotate: 5, z: 6 },
+        mobile: { top: "15%", right: "4%", width: "49%", height: "18%", rotate: 5, z: 6 },
```

```diff
-        mobile: { top: "37%", left: "25%", width: "52%", height: "24%", rotate: -1, z: 7 },
+        mobile: { top: "36%", left: "25%", width: "52%", height: "18%", rotate: -1, z: 7 },
```

```diff
-      mobile: { bottom: "7%", left: "8%", width: "84%", height: "34%", rotate: 1, z: 8 },
+      mobile: { bottom: "5%", left: "8%", width: "84%", height: "30%", rotate: 1, z: 8 },
```

```diff
-        mobile: { top: "48%", left: "2%", width: "32%", height: "5%", rotate: 7, z: 3 },
+        mobile: { top: "49%", left: "2%", width: "32%", height: "4%", rotate: 7, z: 3 },
```

Expected composition: the third film frame ends near 54%; the strip and doodle bridge the interval to the letter, which begins near 65%; light labels remain legible on the black page.

- [ ] **Step 2: Recompose the sticky-note page**

Apply these exact substitutions in `src/layouts/recipes/stickyNotes.ts`:

```diff
-    mobile: { top: "5%", right: "6%", width: "59%", rotate: 4, z: 9 },
+    mobile: { top: "4%", right: "6%", width: "59%", rotate: 4, z: 9 },
```

```diff
-        mobile: { top: "15%", left: "5%", width: "61%", height: "30%", rotate: -6, z: 5 },
+        mobile: { top: "13%", left: "5%", width: "61%", height: "23%", rotate: -6, z: 5 },
```

```diff
-        mobile: { top: "28%", right: "5%", width: "45%", height: "25%", rotate: 7, z: 6 },
+        mobile: { top: "31%", right: "5%", width: "45%", height: "19%", rotate: 7, z: 6 },
```

```diff
-      mobile: { bottom: "9%", left: "10%", width: "79%", height: "40%", rotate: -3, z: 7 },
+      mobile: { bottom: "6%", left: "10%", width: "79%", height: "32%", rotate: -3, z: 7 },
```

```diff
-        mobile: { top: "13%", left: "21%", width: "25%", rotate: -1, z: 10 },
+        mobile: { top: "11%", left: "21%", width: "25%", rotate: -1, z: 10 },
```

```diff
-        mobile: { bottom: "3%", right: "5%", width: "13%", rotate: 8, z: 9 },
+        mobile: { bottom: "2.5%", right: "5%", width: "13%", rotate: 8, z: 9 },
```

```diff
-        mobile: { top: "43%", left: "2%", width: "52%", rotate: -8, z: 8 },
+        mobile: { top: "52%", left: "2%", width: "52%", rotate: -8, z: 8 },
```

Expected composition: the photos overlap from roughly 31–36%, the memory callout bridges the transition into the sticky note, and the heart touches only its lower edge.

- [ ] **Step 3: Recompose the diary entry**

Apply these exact substitutions in `src/layouts/recipes/diaryEntry.ts`:

```diff
-    mobile: { top: "5%", left: "11%", width: "60%", rotate: -2, z: 9 },
+    mobile: { top: "4%", left: "11%", width: "60%", rotate: -2, z: 9 },
```

```diff
-        mobile: { top: "15%", right: "5%", width: "56%", height: "29%", rotate: 6, z: 6 },
+        mobile: { top: "13%", right: "5%", width: "56%", height: "22%", rotate: 6, z: 6 },
```

```diff
-        mobile: { top: "27%", left: "6%", width: "43%", height: "23%", rotate: -6, z: 5 },
+        mobile: { top: "30%", left: "6%", width: "43%", height: "18%", rotate: -6, z: 5 },
```

```diff
-      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
+      mobile: { bottom: "5%", left: "8%", width: "84%", height: "35%", rotate: 1, z: 7 },
```

```diff
-        mobile: { top: "13%", right: "18%", width: "23%", rotate: 3, z: 10 },
+        mobile: { top: "11%", right: "18%", width: "23%", rotate: 3, z: 10 },
```

```diff
-        mobile: { bottom: "2%", right: "2%", width: "17%", height: "16%", rotate: -12, z: 8 },
+        mobile: { bottom: "2%", right: "2%", width: "17%", height: "12%", rotate: -12, z: 8 },
```

Expected composition: photos overlap from roughly 30–35%, the diary note begins near 60%, and the pressed flower crosses its lower-right corner without blocking text.

- [ ] **Step 4: Recompose the event ticket**

Apply these exact substitutions in `src/layouts/recipes/eventTicket.ts`:

```diff
-    mobile: { top: "5%", right: "7%", width: "60%", rotate: 3, z: 9 },
+    mobile: { top: "4%", right: "7%", width: "60%", rotate: 3, z: 9 },
```

```diff
-        mobile: { top: "15%", left: "5%", width: "64%", height: "31%", rotate: -6, z: 5 },
+        mobile: { top: "13%", left: "5%", width: "64%", height: "23%", rotate: -6, z: 5 },
```

```diff
-        mobile: { top: "29%", right: "4%", width: "44%", height: "25%", rotate: 7, z: 6 },
+        mobile: { top: "33%", right: "4%", width: "44%", height: "19%", rotate: 7, z: 6 },
```

```diff
-      mobile: { bottom: "8%", left: "8%", width: "84%", height: "40%", rotate: -1, z: 7 },
+      mobile: { bottom: "6%", left: "8%", width: "84%", height: "32%", rotate: -1, z: 7 },
```

```diff
-        mobile: { top: "2.5%", left: "2%", width: "29%", height: "11%", rotate: -4, z: 8 },
+        mobile: { top: "2%", left: "2%", width: "29%", height: "8%", rotate: -4, z: 8 },
```

```diff
-        mobile: { bottom: "3%", right: "3%", width: "23%", height: "11%", rotate: 8, z: 9 },
+        mobile: { bottom: "2.5%", right: "3%", width: "23%", height: "8%", rotate: 8, z: 9 },
```

Expected composition: the two photos overlap from roughly 33–36%, the note starts near 62%, and both ticket decorations remain ornamental without masking the name or note hint.

- [ ] **Step 5: Recompose the final love letter**

Apply these exact substitutions in `src/layouts/recipes/finalLoveLetter.ts`:

```diff
-    mobile: { top: "5%", left: "7%", width: "63%", rotate: -2, z: 9 },
+    mobile: { top: "4%", left: "7%", width: "63%", rotate: -2, z: 9 },
```

```diff
-        mobile: { top: "15%", left: "5%", width: "58%", height: "30%", rotate: -6, z: 5 },
+        mobile: { top: "13%", left: "5%", width: "58%", height: "23%", rotate: -6, z: 5 },
```

```diff
-        mobile: { top: "27%", right: "5%", width: "48%", height: "26%", rotate: 6, z: 6 },
+        mobile: { top: "32%", right: "5%", width: "48%", height: "20%", rotate: 6, z: 6 },
```

```diff
-      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
+      mobile: { bottom: "5%", left: "8%", width: "84%", height: "35%", rotate: 1, z: 7 },
```

```diff
-        mobile: { top: "13%", left: "20%", width: "25%", rotate: 0, z: 10 },
+        mobile: { top: "11%", left: "20%", width: "25%", rotate: 0, z: 10 },
```

```diff
-        mobile: { top: "9%", right: "3%", width: "27%", height: "12%", rotate: 8, z: 9 },
+        mobile: { top: "7%", right: "3%", width: "27%", height: "9%", rotate: 8, z: 9 },
```

Expected composition: photos overlap from roughly 32–36%, the love letter begins near 60%, and the stamp and heart remain tactile edge details.

- [ ] **Step 6: Recompose the mobile opening and closing pages**

Inside the existing `@media (width < 900px)` block in `src/styles/scrapbook.css`, replace or extend the opening/closing declarations so the resulting mobile rules are exactly:

```css
    .opening-page {
      padding: clamp(0.75rem, 3cqh, 1.2rem);
    }

    .opening-page__copy {
      width: 86%;
      transform: translateY(-3cqh) rotate(-0.6deg);
    }

    .opening-page__copy > p:first-child {
      font-size: clamp(0.42rem, 2.1cqw, 0.62rem);
    }

    .opening-page h1 {
      font-size: clamp(1.75rem, 12cqw, 3.7rem);
    }

    .opening-page__message {
      font-size: clamp(0.88rem, 5cqw, 1.45rem);
      line-height: 1.16;
    }

    .opening-page__route {
      right: 6%;
      bottom: 4%;
      left: 6%;
      align-items: start;
      font-size: clamp(0.35rem, 1.65cqw, 0.48rem);
    }

    .opening-page__route span {
      max-width: 7ch;
    }

    .opening-page__tape {
      top: 6%;
    }

    .opening-page__map {
      bottom: 13%;
      width: 26%;
      height: 12%;
    }

    .opening-page__stamp {
      top: 7%;
      width: 25%;
      height: 8%;
    }

    .opening-page__doodle {
      right: 4%;
      bottom: 20%;
      width: 28%;
    }

    .closing-page {
      padding: clamp(0.45rem, 2cqh, 0.9rem);
    }

    .closing-page__letter {
      width: 86%;
      gap: clamp(0.24rem, 1cqh, 0.55rem);
      padding: clamp(0.62rem, 4.4cqw, 1.15rem);
      transform: translateY(-2cqh) rotate(-1.4deg);
    }

    .closing-page h2 {
      font-size: clamp(1.55rem, 9.5cqw, 3rem);
    }

    .closing-page__letter > p:not(.closing-page__eyebrow) {
      font-size: clamp(0.8rem, 4.2cqw, 1.25rem);
      line-height: 1.13;
    }

    .closing-page__letter strong {
      font-size: clamp(0.95rem, 5.2cqw, 1.6rem);
    }

    .closing-page__postscript {
      max-width: 62%;
      font-size: clamp(0.64rem, 3.2cqw, 0.9rem);
    }

    .closing-page__tape {
      top: 5.5%;
    }

    .closing-page__flower {
      right: 2%;
      bottom: 3%;
      width: 17%;
      height: 15%;
    }

    .closing-page__heart {
      top: 6%;
      right: 5%;
    }
```

Do not duplicate these in a second portrait-only media query. The mobile book keeps the same physical `0.54 : 1` page in portrait and short landscape, while the existing short-height type overrides continue to protect copy at low heights.

- [ ] **Step 7: Check scope, build, and inspect the five pages plus both bookends**

Run:

```bash
git diff --check
git diff -- src/layouts/recipes/filmNegative.ts src/layouts/recipes/stickyNotes.ts src/layouts/recipes/diaryEntry.ts src/layouts/recipes/eventTicket.ts src/layouts/recipes/finalLoveLetter.ts src/styles/scrapbook.css
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Expected: only mobile recipe values and the mobile opening/closing declarations differ; desktop placements remain unchanged; build succeeds.

At 390 × 844 and 320 × 568, inspect Friend 11 through Friend 15, then the opening and closing pages. Confirm all five material identities remain distinct, every note remains reachable, the black film page remains legible, and the opening/closing compositions use the full tall sheet without looking stretched or leaving a dead lower half. Repeat opening/closing at 844 × 390 to confirm the short-height type overrides keep essential copy visible.

- [ ] **Step 8: Commit contributions 11–15 and the bookends**

```bash
git add src/layouts/recipes/filmNegative.ts src/layouts/recipes/stickyNotes.ts src/layouts/recipes/diaryEntry.ts src/layouts/recipes/eventTicket.ts src/layouts/recipes/finalLoveLetter.ts src/styles/scrapbook.css
git commit -m "feat: finish taller mobile scrapbook compositions"
```

Expected: one final composition commit containing five recipes and the shared bookend stylesheet.

### Task 7: Complete the cross-device interaction and requirement audit

**Files:**

- Inspect: every file listed in this plan
- Modify only if an observed failure requires a focused correction
- Do not modify: `src/content/scrapbook.ts`, `package.json`, `package-lock.json`, `index.html`, hosting/deployment files

- [ ] **Step 1: Run the final static scope audit**

Run:

```bash
git status --short
git diff --check
git diff --check 51aeb44..HEAD
git diff --name-only 51aeb44..HEAD
git diff -- src/content/scrapbook.ts package.json package-lock.json index.html
if rg -n 'user-scalable|maximum-scale|touch-action:[[:space:]]*none' index.html src; then
  exit 1
else
  echo "zoom accessibility guard passed"
fi
```

Expected: no whitespace errors; changed production files are limited to the four shell/component styles plus the 15 recipe files listed in the file map; the protected-file diff prints nothing; the zoom guard passes. The design spec and this plan may also appear as documentation changes relative to the baseline.

- [ ] **Step 2: Run the authoritative production build under the pinned Node version**

Run:

```bash
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
node --version
npm run build
```

Expected: `node --version` prints `v22.12.0`; `tsc --noEmit` reports no errors; Vite reports a successful production build and writes `dist/`. No unit tests are created or run.

- [ ] **Step 3: Start one local preview for browser verification**

Run in a dedicated terminal:

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

Expected: Vite reports the local URL `http://127.0.0.1:4174/`. Use the `browser:control-in-app-browser` skill for repeatable inspection if a controllable tab is available.

- [ ] **Step 4: Verify the desktop physical-book experience at 1440 × 900**

Perform this exact sequence:

1. Load the closed cover and activate it with the keyboard.
2. Wait one second after the opening animation.
3. Confirm the broad blue cover remains cropped on the left and the open spread has not shrunk or moved.
4. Use Next, Previous, Arrow keys, Page Up/Page Down, Home, End, and page-edge taps.
5. Open notes from at least three different material variants, including a long letter.
6. Close each by button, Escape, and backdrop respectively.
7. Return to the opening page and activate Back to close the cover.

Expected: the retained cover never intercepts interaction; each dialog is centered; the long note scrolls internally; focus restores correctly; page turns remain continuous; closing restores focus to the cover button.

- [ ] **Step 5: Verify all mobile pages at 390 × 844 and 320 × 568**

At each viewport, traverse in order: closed cover → opening page → Friend 01 through Friend 15 → closing page → back to closed cover.

For every page record pass/fail for:

- complete paper edge visible with no native document vertical scroll;
- name readable, note trigger reachable, and controls at least 44 × 44 CSS pixels;
- photos not stretched and captions not detached from their frames;
- intentional overlap without essential text or interaction being covered;
- retained blue cover edge visible after opening but not tappable;
- horizontal swipe, page-edge taps, Previous, and Next all operate once per gesture;
- centered reading view and internal scrolling for long content.

Expected: the physical page consumes roughly 80–86% of viewport height, all 15 recipes remain recognizably unique, and neither viewport degrades into a normal vertical feed.

- [ ] **Step 6: Verify landscape, resize, reduced motion, and touch accessibility**

At 844 × 390, confirm the full book and controls fit and the document does not vertically scroll. Resize/rotate while positioned on a middle contribution and confirm the same logical memory remains active.

With `prefers-reduced-motion: reduce`, open/close the cover and navigate pages. Expected: no large 3D cover rotation, the settled cover remains visible at its static left offset, and all state changes complete.

On a touch-capable browser/device, double-tap the scrapbook, pinch with two fingers, then test a long dialog. Expected: double tap does not zoom; pinch zoom does; the browser may pan the magnified visual viewport; at default `1×` the document remains locked while the dialog content alone can scroll. If the available browser cannot synthesize real multi-touch gestures, explicitly report double-tap/pinch as unverified instead of inferring them from CSS.

- [ ] **Step 7: Check runtime diagnostics**

Inspect the browser console and network panel after traversing the full scrapbook.

Expected: no uncaught errors, React warnings, focus errors, or failed requests. Because every placeholder has `src: null`, placeholder photos render locally without generating 404 requests.

- [ ] **Step 8: Correct only observed failures, then repeat the affected checks**

If a failure is found, make the smallest change in the owning file and document the observation in the commit message. Do not tune unrelated pages or alter content. Re-run:

```bash
git diff --check
source /Users/yonathan/.nvm/nvm.sh
nvm use 22.12.0
npm run build
```

Then repeat the exact viewport/interaction check that failed. Expected: the observed failure is gone and the production build still passes.

- [ ] **Step 9: Commit any evidence-driven final correction**

Skip this step if Task 7 required no source changes. Otherwise stage the tracked implementation correction, inspect it, and use one narrowly descriptive final message:

```bash
git add -u src
git diff --cached --stat
git commit -m "fix: resolve final scrapbook polish findings"
```

Expected: a narrowly scoped final correction commit. Never create a speculative “cleanup” commit.

- [ ] **Step 10: Produce the final verification handoff**

Run:

```bash
git status --short
git log --oneline --decorate -8
```

Expected: the worktree contains no unintended tracked changes; `.superpowers/` remains ignored; the log shows the focused commits from Tasks 1–6 plus any evidence-driven Task 7 correction. Report build evidence, browser viewport coverage, interaction results, reduced-motion results, and any genuinely unavailable multi-touch checks. Do not claim an unavailable browser check passed.

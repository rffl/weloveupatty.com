# Page-Turn Physical Continuity Fixes Design

**Status:** Approved in conversation on 2026-07-21

## Goal

Preserve the approved two-sided scrapbook flip while correcting four physical-illusion failures:

1. desktop turns must not create rectangular shadows or a changing/doubled centre divider;
2. mobile turns must leave the previous sheet visibly parked over the retained blue cover and allow that sheet to be pulled back from the left;
3. the final page must reject every forward turn without creating a leaf or tug; and
4. a real-device drag must keep the projected paper edge aligned with the finger instead of rotating faster than it.

The implementation is one connected page-physics pass followed by one consolidated review. Existing accessibility behavior is left intact, but no new accessibility work is in scope. Unit tests remain explicitly out of scope at the user's request.

## Confirmed root causes

### Desktop shadow and spine

The book has both a stable `box-shadow` and an ancestor `filter: drop-shadow(...)`. While a turn is active, the page region permits overflow, so the filter includes the protruding leaf in its alpha silhouette and draws a large rectangular shadow around it.

A second axis-aligned cast-shadow element covers 48% of the spread. It does not follow the rotating leaf and therefore appears as a translucent rectangular box over the stationary page.

The centre divider is also drawn twice: the permanent book spine remains visible while a differently sized animated gutter shade changes opacity and width. Their combined darkness and thickness vary during the turn.

### Mobile parked sheet and grab area

The physical scene is currently mounted only while a turn is active. On landing, the logical page is committed and the scene is unmounted, so no turned sheet remains over the blue cover.

All gesture handlers are attached to the current page-sized surface. The visible cover area lies outside that surface and is non-interactive, so a backward swipe cannot begin where the parked sheet should sit.

### Final-page forward drag

Automatic navigation already rejects out-of-range destinations. Direct drag is the sole exception: it deliberately creates a same-page, non-committing leaf to provide the formerly approved boundary tug.

### Real-device finger tracking

Pointer events, pointer capture, `touch-action`, and the request-animation-frame path are functioning. The mismatch is mathematical: a linear mapping rotates the page almost 178 degrees after only 72% of a page-width drag. A rotating edge moves nonlinearly on screen, so the paper necessarily outruns the finger.

## Approved design

### 1. Stable desktop lighting and spine

- Replace the book-level filter shadow with an equivalent stable `box-shadow` attached only to the book rectangle.
- Disable the broad transient cast-shadow on desktop.
- Disable the animated gutter shade on desktop and retain the single permanent book spine.
- Keep the two-sided 3D rotation, leaf-face shading, moving paper edge, page inset shadows, and existing physical settlement timing.
- Mobile may retain its local gutter/shadow treatment where it does not create the desktop artifacts.

The idle and turning states will therefore share the same centre divider, while the leaf itself continues to carry the physical lighting cues.

### 2. Persistent mobile parked leaf

When mobile is idle and the active page index is greater than zero:

- render the immediately preceding page as a non-engageable physical leaf resting at the existing approximately `-178deg` position;
- show the sheet's back with faint mirrored previous-page content, matching the appearance of the completed turn;
- place it behind the current page but above the retained blue cover;
- allow it to extend left beyond the page region while the current page remains clipped by its own mobile-page viewport; and
- hide the parked representation whenever an active turn scene takes over, avoiding duplicate sheets.

The first page has no parked history leaf. Each later page shows only the most recently turned sheet, not an ever-growing DOM stack.

### 3. Backward swipe from the parked sheet

Add a narrow, non-focusable hit strip extending left from the mobile spine over the visible parked paper. Its width follows the existing mobile edge affordance, approximately 52–64 CSS pixels.

Pointer events from the strip bubble to the existing page-turn gesture handler, which keeps the current page width as the motion reference. A rightward drag begins the existing mobile backward turn. Visual page content inside the parked sheet remains non-interactive so notes or photo elements cannot steal that gesture.

### 4. Finger-aligned drag geometry

Keep release thresholds and velocity rules unchanged. Change only drag-to-progress geometry on mobile.

For a forward or backward drag distance `d` and mobile leaf width `w`, derive progress from the projected rigid-page edge:

```text
progress = acos(clamp(1 - d / w, -1, 1)) / pi
```

This gives the important physical landmarks:

- no movement produces zero rotation;
- pulling one page width moves the outer edge to the spine, approximately 90 degrees; and
- the release settlement completes or returns the remaining motion.

Reversing across the pointer-down position still clamps progress to zero. Desktop drag geometry remains unchanged unless implementation reuse can preserve its current feel exactly.

The existing request-animation-frame/latest-value path remains. Conditional scene mounting is not refactored unless browser evidence after the geometry fix still shows a separate start-frame delay.

### 5. Hard final boundary

Direct drag may start only when an adjacent destination exists. A final-page forward drag returns before creating `turnState`, so it produces no leaf, shadow, progress change, pending intent, or snap-back.

Backward navigation from the final page remains valid. Backward swipe from the opening page continues to use the existing cover-close behavior. Buffered directions continue to be validated against the projected landing page.

## Scope

Expected implementation files:

- `src/scrapbook/pageTurnMotion.ts`
- `src/scrapbook/useSwipeGesture.ts`
- `src/scrapbook/usePageTurner.ts`
- `src/scrapbook/PageTurner.tsx`
- `src/scrapbook/Scrapbook.tsx`
- `src/styles/scrapbook.css`

Do not modify scrapbook content, the 15 friend entries, layout recipes, dependencies, viewport metadata, cover behavior, dialog behavior, reduced-motion behavior, or hosting configuration.

## Consolidated verification

After all implementation work is complete, run one review phase:

- Node 22.12.0 TypeScript/Vite production build and diff/source audits;
- desktop idle, forward, backward, slow drag, and settlement at 1440 by 900, confirming no moving rectangular shadow and one uniform spine;
- mobile idle/forward/backward at 390 by 844 and a narrow 320-pixel viewport, confirming the parked previous sheet remains over the blue cover and accepts a rightward pull;
- finger-position sampling during a slow mobile drag, confirming the projected outer edge follows the new physical curve instead of reaching the spine early;
- final-page button, edge, keyboard, and direct-drag checks, confirming no forward leaf is created;
- rapid buffering, reversal, notes, retained cover, viewport containment, and page-progress landing checks to guard established behavior; and
- genuine real-device retest by the user for final tactile judgment when available.

Unavailable device-only checks must be reported rather than inferred. No unit tests will be added or run.

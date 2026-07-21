# Persistent Page Stack and Binding Continuity Design

**Status:** Approved in conversation on 2026-07-21

## Goal

Complete the physical scrapbook illusion in three connected areas:

1. mobile pages that have already been turned must remain as a believable stack over the open blue cover throughout forward and backward motion;
2. the desktop centre binding must keep one visual identity before, during, and after a turn; and
3. button-triggered Next and Back turns must feel slightly slower without weakening direct finger tracking.

This design supersedes the single parked-leaf behavior in `2026-07-21-page-turn-physical-continuity-fixes-design.md`. The previous mobile rule that hid the parked page during every active turn is no longer valid.

## Confirmed root causes

### Mobile history disappears during motion

The current mobile model renders only `activePageIndex - 1`, and only while no turn is active. Starting either direction immediately unmounts that parked sheet. The active leaf then moves over the exposed blue cover until settlement remounts a different parked sheet.

That behavior treats the left paper as a temporary decoration rather than accumulated physical pages. It also leaves no underlying sheet to reveal when the top sheet is pulled backward.

### Desktop binding changes identity

Desktop uses two separate bindings:

- the resting `.scrapbook-book::after`; and
- the active `.page-turner__scene-spine`.

The resting binding is hidden while the active binding is mounted, then restored when the scene unmounts. Although their declared colours and width are similar, their paint order and occlusion differ. The active leaf hides part of the scene binding near settlement, and the destination pages expose their own gutter shadows around it. The result is the wider, darker, multi-strip binding during motion followed by a snap back to the normal narrow binding.

### Button turns are fast because of one automatic duration

Next and Back buttons use `automaticTurnDurationMs`, currently `370ms`. Direct dragging does not use this constant: it follows pointer progress per animation frame, and gesture settlement has its own duration range. The automatic duration can therefore change independently.

## Approved design

### 1. Persistent bounded mobile history stack

Mobile will maintain a stable visual history stack separately from the active turning leaf.

The top index of the stable stack is derived from the frozen turn snapshot:

- idle on page `i`: `i - 1`;
- forward turn `i -> i + 1`: `i - 1`;
- backward turn `i -> i - 1`: `i - 2`; and
- general active formula: `min(sourcePageIndex, destinationPageIndex) - 1`.

This ownership rule prevents duplication. During a backward turn, page `i - 1` belongs to the active leaf, so the stable stack ends at `i - 2` beneath it.

The visual stack will contain:

- the latest two genuine previous-page backfaces, rendered oldest first;
- the top sheet at exactly the active leaf's parked endpoint, approximately `rotateY(-178deg)`;
- the second real sheet with only a tiny paper offset, never enough to look like a separate floating card; and
- one or two lightweight paper-edge silhouettes when additional older pages exist.

Only two full page compositions remain mounted. This gives the correct page underneath every backward lift while avoiding the image, layout, and compositing cost of mounting as many as sixteen full scrapbook pages on a phone. Older pages remain logically present and are represented by physical page thickness until they approach the top of the stack.

### 2. Forward, backward, and cancellation behavior

During a forward turn:

- the existing history stack remains mounted;
- the current right-hand page turns above it; and
- after settlement, that page becomes the new top stable sheet without a positional snap.

During a backward turn:

- the current top history page becomes the active leaf;
- the next genuine previous page is already mounted underneath;
- the active leaf lifts to the right; and
- after settlement, only the revealed underlying stack remains.

If a gesture is cancelled, the active leaf returns to the same transform used by the stable top sheet before ownership returns to the idle stack. No blue-cover flash or duplicate page is allowed.

The blue cover is visible beneath paper only when there are genuinely no earlier pages in the history stack, such as the first forward turn or the final part of returning to the opening page.

### 3. Mobile stack layer and interaction contract

The existing book-level mobile flattening remains so sibling order is deterministic:

- open blue cover: book-level `z-index: 5`;
- page region: book-level `z-index: 10`;
- stable history stack: page-turner local layer behind current content;
- current right page: above the stable stack;
- active turn scene and leaf: above both current content and stable history.

All stable page compositions remain `aria-hidden`, inert, and non-interactive. The backward grab area exists only while idle and covers the visibly exposed left paper rather than only a narrow hinge strip. Its pointer events continue bubbling to the existing page-turn gesture surface, whose current-page width remains the motion reference.

### 4. One persistent desktop binding

Desktop will use one persistent binding element inside the page-turner scene instead of swapping between a book pseudo-element and an active-only spine.

- The scene remains mounted on desktop even while no page is turning.
- The same binding DOM element, gradient, width, height, and shadow is visible at rest and in motion.
- The desktop book pseudo-element is removed or disabled; the separate mobile hinge remains unchanged.
- Stationary pages paint below the binding.
- Through the main turning arc, the moving leaf paints above the binding so no fixed strip cuts through the paper.
- Near the parked endpoint, the nearly flat leaf tucks beneath the binding while remaining above the underlying page. The symmetric backward turn begins beneath the binding and lifts above it early in the arc.

The endpoint layer change occurs during the final or initial approximately 10–12 percent of motion, while the sheet is almost flat. This makes the action read as paper sliding under a physical binding and ensures the complete resting binding is already visible before the active leaf unmounts. There must be no post-animation binding swap, width change, or delayed visual cleanup.

### 5. Slightly slower button turns

Increase automatic Next and Back turns from `370ms` to `450ms` and retain the existing easing curve.

Unchanged behavior:

- direct drag remains one-to-one with the finger;
- gesture-release settlement keeps its current `180–320ms` behavior;
- swipe distance and velocity thresholds remain unchanged; and
- buffered navigation still launches the next valid turn on the next animation frame after settlement.

The animation fallback keeps its full `120ms` safety margin instead of retaining the current `500ms` cap, which would leave only `50ms` of margin for a `450ms` automatic turn.

## Scope

Expected implementation files:

- `src/scrapbook/Scrapbook.tsx`
- `src/scrapbook/PageTurner.tsx`
- `src/scrapbook/pageTurnMotion.ts`
- `src/styles/scrapbook.css`

`usePageTurner.ts` may change only if required to expose an already available frozen turn value cleanly. No content entries, layouts, assets, dependencies, dialogs, hosting configuration, or reduced-motion behavior are redesigned.

No unit tests will be written or run, per the user's instruction.

## Consolidated verification

After implementation, perform one review phase:

- run the TypeScript/Vite production build and `git diff --check`;
- compare desktop resting, forward, backward, late-forward, and early-backward centre binding at a wide viewport, confirming one unchanged binding with no rectangular motion shadow;
- verify Next and Back automatic turns take approximately `450ms`, while held mobile dragging still keeps the projected page edge aligned with the pointer;
- verify mobile idle, forward, backward, cancellation, and rapid sequential turns at representative tall and short phone viewports;
- confirm a forward turn keeps the existing left stack visible and adds the landed page on top;
- confirm a backward turn lifts only the top sheet and reveals the genuine page beneath;
- confirm the blue cover appears only when the history stack is empty;
- confirm the exposed left paper starts a backward drag across its visible area;
- confirm first-page, final-page, progress-counter, retained-cover, note-opening, and viewport-containment behavior remain intact; and
- inspect browser logs for runtime errors.

Real-device tactile judgment remains the final user check. Any device-only behavior that cannot be observed locally must be reported rather than inferred.

# Patty Scrapbook Physical Page-Turn Interaction — Design Specification

**Date:** 21 July 2026

**Status:** Approved design awaiting written-spec review

**Baseline:** `3a28382 feat: finish taller mobile scrapbook compositions`

## 1. Purpose

Replace the scrapbook's delayed, release-triggered page change with a responsive physical-paper interaction on desktop and mobile.

The approved result must:

1. accept rapid sequential swipes without an apparent one-second cooldown;
2. make swipes and mobile page-edge taps modestly easier to trigger; and
3. visibly turn a two-sided sheet around the scrapbook spine instead of sliding and fading the composition.

This work refines the existing physical scrapbook. It must preserve Patty's content, all 15 art-directed contribution layouts, the retained opened cover, the tall mobile canvas, the centered reading view, pinch-zoom accessibility, and the original Melbourne Memory Table art direction.

## 2. Current behavior being replaced

The current implementation weakens the physical illusion in four connected ways:

- a drag translates the live composition by only a small amount; the rotating leaf is created only after release;
- gestures, edge taps, controls, and navigation are blocked for the complete 520ms turn, with an 800ms fallback when animation completion is missed;
- the leaf's reverse side is blank paper while the destination page has already been swapped underneath;
- the rotating leaf fades almost completely, and mobile clipping hides much of the second half of its rigid turn.

The result can read as “small slide, release, canned fade” and causes swipes made during the turn to be discarded.

This specification supersedes the earlier rule that repeated gestures are ignored during settling. One bounded pending intent is now part of the approved behavior.

## 3. Approved interaction model

The selected direction is **physical settle plus one remembered swipe**.

### Direct manipulation

- A one-finger horizontal drag may start anywhere on the non-interactive page surface.
- The visible paper sheet lifts and rotates with the finger from the beginning of the horizontal gesture.
- Buttons, links, dialogs, openable notes, form controls, and their descendants remain excluded from page-drag capture.
- Existing vertical-intent cancellation remains: a clearly vertical one-finger gesture releases page-turn capture instead of navigating.
- Click suppression still prevents a drag release from accidentally opening a note or activating an edge tap.

### Swipe commitment

- The distance commitment threshold decreases from 56 CSS pixels to **44 CSS pixels**.
- A deliberate quick flick may commit after at least **24 CSS pixels** when recent horizontal velocity reaches approximately **0.45 CSS pixels per millisecond** and horizontal movement dominates vertical movement.
- Velocity is derived from a short recent sample window rather than the full gesture, so a slow hold followed by a deliberate flick still behaves naturally.
- A gesture that meets neither rule settles back without changing the page.

### Mobile edge taps

- Swiping continues to work over the full non-interactive page; it does not become edge-only.
- The invisible mobile left/right edge-tap band increases from `max(44px, 9%)` to **`clamp(52px, 11%, 64px)`** of the rendered page width.
- The existing top and bottom exclusion bands remain, preventing decorative corners and controls from becoming oversized accidental navigation targets.
- Desktop edge-tap sizing remains unchanged.

### Timing and rapid input

- A rejected or incomplete drag returns to rest in approximately **140–180ms**.
- A committed drag settles over approximately **180–320ms**, proportional to the remaining rotation distance and release velocity.
- A button, keyboard, or edge-tap turn uses the same physical sheet and completes in approximately **360–380ms**.
- There is no independent cooldown after settlement.
- While one committed sheet is settling, the system accepts one additional valid navigation intent.
- If more gestures arrive before settlement, the **latest valid direction replaces the pending direction**. This makes the eventual result reflect the user's most recent intention without creating multiple simultaneous sheets.
- The pending turn begins on the next animation frame after the active sheet lands.
- No pending intent may cross the closed-cover boundary or navigate beyond the final page.

## 4. Physical page construction

### Shared material behavior

- The page-turn layer uses one stable 3D scene with perspective applied at the book/turn-scene level.
- A moving sheet has a front face, a reverse face, and a thin visible paper edge.
- The outgoing content appears on the physically correct front face.
- The appropriate incoming page appears on the reverse face or underneath the moving sheet according to turn direction and responsive mode.
- The normal-motion turn does not use opacity fading to hide the content swap. Rotation, occlusion, and backface visibility perform the reveal.
- A restrained fold/curl band, moving edge highlight, gutter shade, and cast shadow vary with turn progress. The strongest depth cue occurs near the edge-on portion of the turn.
- The curl remains subtle and handmade. It must not resemble a rubber wave, glossy app transition, or exaggerated page-flip demo.

### Desktop spread

- Forward navigation turns the outgoing right half-sheet around the centre spine while the outgoing left half remains stationary until naturally occluded.
- The target spread is prepared underneath. Its left page is represented on the reverse of the turning sheet and its right page is revealed underneath.
- Backward navigation mirrors that construction: the outgoing left half turns toward the right, while the correct page from the previous spread appears on its reverse and the remaining target half is revealed underneath.
- The centre binding remains stable throughout; the whole two-page composition never slides as one flat panel.

### Mobile held page

- The full current page is treated as the right-hand page of the retained physical scrapbook.
- Forward navigation turns that page leftward around the retained left spine, briefly passing over the visible blue-cover sliver before revealing the target page underneath.
- Backward navigation brings the previous sheet back from the same left spine rather than rotating the current page around the outer edge.
- The transient turn layer may extend beyond the inner page edge, but the overall experience viewport continues to prevent document overflow or native page scrolling.
- The retained opened cover stays visually attached and remains non-interactive, inert, and hidden from assistive technology.

## 5. State and component architecture

Only one active physical sheet is allowed at a time.

### Turn state

The page-turn state is modelled explicitly with phases equivalent to:

- `idle`;
- `dragging`; and
- `settling`.

An active turn snapshot contains the source page/spread, destination page/spread, direction, current progress, a settle target of `source` or `destination`, and a unique turn identifier. A separate optional pending intent stores at most one direction.

The logical active page is not committed at pointer release. It changes only after a committed sheet lands. This keeps visible progress, focusability, and assistive-technology state synchronized with the physical result.

### Responsibility boundaries

- `useSwipeGesture` owns primary-pointer tracking, direction discrimination, recent velocity samples, drag progress, pointer cancellation, and click suppression. It reports gesture lifecycle events rather than directly mutating the page index.
- `usePageTurner` owns the logical page, turn phases, source/destination snapshots, commitment, boundary validation, one pending intent, completion, and cover-boundary rules.
- `PageTurner` owns the transient physical scene: destination content underneath, stationary content, front/back sheet faces, progress-driven transforms, and completion signals.
- `Scrapbook` continues to coordinate cover state, page rendering, focus, responsive mode, and accessible busy state.
- `SpreadRenderer` remains the canonical renderer for mobile pages and desktop spreads. Any transient copies receive explicit side/face context rather than a separate content implementation.

No content model, contribution recipe, photo placeholder, or alternate mobile DOM tree is introduced.

### Frame updates

- Pointer movement updates the leaf transform through `requestAnimationFrame` and direct element styles. Auxiliary paper-edge and shadow cues receive synchronized CSS custom-property values from the same frame update.
- React state changes only for meaningful lifecycle transitions, page indices, direction, and pending intent; it does not re-render the scrapbook on every raw pointer event.
- Web Animations API settlement starts from the exact current angle and uses the remaining distance and release velocity to calculate duration.
- The final settled state has one completion owner plus a safety fallback at the computed duration plus 120ms, capped at 500ms total. The existing fixed 800ms fallback is removed.

## 6. Navigation data flow

### Drag turn

1. A valid pointer-down begins tracking without changing the logical page.
2. Once horizontal direction is established, the turner validates the adjacent destination and creates a source/destination snapshot.
3. The destination is rendered underneath as an inert visual layer, and the physical sheet follows pointer progress.
4. Pointer release either commits the destination or settles the sheet back to the source.
5. On a committed landing, the logical page and progress indicator update atomically, transient layers are removed, and normal content becomes interactive.
6. A valid pending intent, if present, is revalidated and starts on the next animation frame.

### Button, keyboard, and edge-tap turn

These inputs create the same source/destination snapshot and run the same physical sheet from rest to its completed angle. They do not use a separate fade or page-swap path.

### Cancelled input

Pointer cancellation, lost capture, a below-threshold drag, or invalid direction returns the sheet to its source. The page index and progress announcement do not change.

## 7. Interruption, resize, and boundary handling

- A second physical leaf never overlaps an active leaf. Rapid input is represented only by the one pending intent.
- At the first page, a backward action closes the cover only when no page turn is active or pending. A buffered backward gesture cannot unexpectedly close the cover.
- At the last page, forward intents are rejected without adding a pending action.
- If responsive mode or orientation changes during an uncommitted drag, the drag cancels to its source before recomposition.
- If responsive mode or orientation changes during a committed settle, the destination commits once, transient state is cleared, and the logical page is recomposed in the new mode.
- Animation cancellation and the safety fallback resolve according to the recorded committed destination, preventing a half-turned visual or mismatched page index.
- Component unmount clears animation frames, pointer state, pending intent, and fallbacks.
- A reading dialog or other interactive object cannot open from the visual duplicate sheet.

## 8. Accessibility and input safeguards

- Page-turn buttons remain real buttons, and keyboard navigation remains available.
- Swipe is never the only navigation mechanism.
- The semantic current content becomes inert while its visual duplicate is turning.
- Destination, stationary, and moving visual copies are `aria-hidden` and inert until the destination lands.
- `aria-busy` covers dragging, settling, and any immediately chained pending turn.
- The live progress text announces only landed pages, not transient drag percentages.
- Focus never moves into a page that is still underneath or on the reverse of the turning sheet.
- Note/dialog focus management and focus restoration remain unchanged.
- `touch-action` continues to preserve custom horizontal gestures and deliberate two-finger pinch zoom. The implementation must not use `touch-action: none`, `user-scalable=no`, or `maximum-scale=1`.
- Native page scrolling at default mobile scale remains disabled, while enlarged letters retain their internal vertical scrolling.
- Accidental double-tap zoom remains suppressed through the existing interaction-surface behavior.

### Reduced motion

- Reduced-motion mode uses the same navigation state machine, pending-intent behavior, boundaries, and semantic commit timing.
- It does not scrub or rotate a 3D sheet with the finger.
- A committed change uses the existing restrained approximately 140ms fade/depth transition.
- A cancelled drag produces no large motion.
- Rapid gestures still avoid an arbitrary cooldown.

## 9. Performance constraints

- Keep at most one transient sheet, one destination layer, and the necessary stationary half in the DOM.
- Animate transforms and lightweight pseudo-element gradient opacity/position. Avoid animated filters, large blurred layers, canvas, WebGL, and DOM-strip meshes.
- Apply `will-change` only while dragging or settling.
- Preserve adjacent-image preloading so destination photos are ready before the turn begins.
- Avoid layout reads on every pointer move. Cache turn bounds at gesture start and schedule at most one visual update per animation frame.
- Preserve the current single content source and do not duplicate personal content in animation-specific data structures.

## 10. Expected implementation scope

The implementation is expected to remain focused on:

- `src/scrapbook/useSwipeGesture.ts`;
- `src/scrapbook/usePageTurner.ts`;
- `src/scrapbook/PageTurner.tsx`;
- `src/scrapbook/Scrapbook.tsx`;
- `src/scrapbook/SpreadRenderer.tsx` only if face-specific rendering context is required;
- page-turn tokens and rules in `src/styles/tokens.css`, `src/styles/scrapbook.css`, and `src/styles/accessibility.css`.

Small focused helpers or types may be added when they make the gesture/state/rendering boundaries clearer. No dependency, content, recipe, hosting, metadata, or deployment changes are required.

## 11. Verification strategy

The user explicitly requested no unit tests. Do not create or run unit tests and do not introduce a unit-test framework.

Verification consists of:

- TypeScript checking and a clean Vite production build under the project's supported Node version;
- source review confirming one active leaf, one pending intent, boundary validation, cleanup, inert duplicates, and the absence of restrictive zoom metadata;
- desktop browser checks for forward/back half-sheet turns, stationary halves, correct front/back content, controls, keyboard input, rapid input, and first/last boundaries;
- portrait mobile checks at representative 390 × 844 and 320 × 568 sizes for direct finger tracking, the 44px/flick commitments, the wider edge-tap bands, rapid back-and-forth swipes, the retained cover sliver, and absence of page-level scrolling;
- short mobile-landscape and resize/orientation checks during idle, dragging, and settling;
- note/dialog checks confirming page gestures do not steal interactive input and animation copies cannot open content;
- real touch checks for two-finger pinch zoom, accidental double taps, pointer cancellation, and fast repeated swipes;
- reduced-motion checks for the same no-cooldown navigation flow without 3D rotation;
- runtime console review for animation, pointer-capture, focus, and rendering errors.

If controllable browser or real multi-touch testing is unavailable, those checks must be reported as unverified rather than inferred from source or build output.

## 12. Out of scope

- photorealistic paper deformation through canvas, WebGL, or a multi-strip mesh;
- multiple simultaneous flying sheets or an unbounded gesture queue;
- changing the retained-cover opening/closing design;
- changing Patty's copy, photos, placeholders, contribution order, or 15 layouts;
- changing the taller mobile viewport composition;
- changing reading-view behavior;
- adding dependencies without separate approval;
- deployment or hosting work;
- unit tests.

## 13. Success criteria

The change is successful when:

- the page visibly follows the finger as a two-sided physical sheet;
- mobile and desktop turns pivot around the correct scrapbook spine;
- no blank reverse face, opacity dissolve, or flat whole-composition slide disguises the turn;
- incomplete drags settle back cleanly without navigation;
- committed turns settle quickly and accept one latest buffered direction;
- rapid back-and-forth swipes no longer require the user to wait and retry;
- mobile swipes and edge taps are modestly easier without stealing note/button input;
- page index, visible content, accessibility state, and progress announcements agree after every settle, cancellation, boundary, and resize;
- pinch zoom, reduced motion, dialog interaction, retained cover, and no-scroll mobile behavior remain intact;
- TypeScript and the production build pass without unit tests; and
- the worktree contains no unrelated implementation changes.

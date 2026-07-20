# Patty Scrapbook Physical Viewport Polish — Design Specification

**Date:** 20 July 2026

**Status:** Approved design awaiting written-spec review

**Baseline:** `36038fd fix: harden scrapbook content and accessibility`

## 1. Purpose

Polish three parts of Patty's scrapbook that currently weaken the physical-book illusion:

1. enlarged letters appear at the top-left instead of centered;
2. the turned cover disappears as soon as its opening transition settles;
3. portrait mobile pages leave excessive space above and below the book.

The changes must preserve the approved Melbourne Memory Table art direction, the 15 unique contribution recipes, the single content source, and the same physical scrapbook identity on desktop and mobile.

## 2. Approved outcomes

### Centered enlarged letters

- Every `ReadingView` opens in the visual center of the current viewport on desktop and mobile.
- Centering is explicit and does not depend on browser default `<dialog>` margins, which may be removed by the CSS reset.
- The paper remains slightly imperfect and rotated; only the dialog's viewport placement becomes reliably centered.
- The existing modal behavior, close button, focus trap, focus restoration, maximum dimensions, text selection, and keyboard-focusable scroll region remain intact.
- Long letters scroll inside their paper content region. The scrapbook behind the modal does not scroll.

### Retained opened cover

- After the opening animation settles, the cover remains rendered at its fully turned position instead of becoming `visibility: hidden`.
- Desktop matches the approved reference screenshot: a substantial blue cloth cover remains to the left of the open pages, while its outer portion extends beyond and is cropped by the viewport.
- The open page spread keeps its current size and position. Pages do not shrink to create a separate column for the cover.
- Mobile preserves the same physical object. Because the viewport is narrow, only a small blue cloth portion is expected to remain visible beside the left side of the taller page.
- The retained cover is visual only while open: it has no pointer interaction, is removed from keyboard navigation, and is hidden from assistive technology. This prevents the obsolete “Open scrapbook” action from being announced or activated.
- Using Back from the opening page starts the existing closing transition from the retained open position and returns the cover to its closed state.
- The cover must not intercept note taps, page-edge taps, controls, swipes, or dialog interaction.
- With reduced motion enabled, the retained cover uses a static opened offset plus the existing restrained fade/depth treatment; it must not reintroduce a large 3D rotation.

## 3. Taller portrait-mobile composition

### Viewport geometry

- Portrait mobile uses a taller physical scrapbook page, targeting an aspect ratio near `0.54 : 1` instead of the current `0.72 : 1`.
- Page height is derived from the dynamic viewport after reserving safe-area padding and the navigation-control track.
- At representative portrait sizes such as 390 × 844 and 320 × 568, the physical page should occupy roughly 80–86% of the available viewport height whenever width and safe-area constraints allow.
- The book stays fully visible. Filling the height must not crop page edges or place essential content outside the viewport.
- The initial closed cover, opening page, all 15 contribution pages, and closing page share the taller mobile canvas.
- Short mobile-landscape viewports keep a separate height-constrained composition so the book and controls remain visible without vertical document scrolling.

### Recipe recomposition

- All 15 mobile contribution recipes are reviewed and rebalanced individually for the taller canvas.
- Existing photo, note, caption, name, and decoration proportions are preserved unless a modest size adjustment improves legibility.
- Objects may move vertically, overlap differently, or use revised top/bottom offsets. Photos and paper objects are never stretched merely to fill space.
- Each page must retain its current material identity, rotations, controlled chaos, and discoverable note trigger.
- Opening and closing-page decorations are also rebalanced so the additional height feels intentionally composed rather than empty.
- Desktop recipe geometry remains unchanged except for the visible retained-cover layer around the book.

## 4. Mobile scrolling and gesture behavior

- At the default `1×` scale, the scrapbook experience remains locked to the mobile viewport. The document does not natively scroll up or down and should not expose rubber-band space around the table surface.
- The one exception is a long enlarged letter: its internal paper content may scroll vertically while the modal backdrop and scrapbook remain fixed.
- Accidental double-tap zoom is suppressed on the scrapbook interaction surface.
- Deliberate two-finger pinch zoom remains available for accessibility.
- After a deliberate pinch zoom, the browser may pan its enlarged visual viewport so the user can inspect magnified content. That accessibility behavior is distinct from page-level scrolling at the default scale.
- The implementation must not use `user-scalable=no`, `maximum-scale=1`, or a global `touch-action: none` rule.
- Touch-action rules must preserve the existing custom one-finger horizontal page swipe, note taps, page-edge taps, and button activation while allowing pinch zoom.
- Dynamic browser chrome, safe-area insets, and orientation changes must not create a second document-sized scroll area.

## 5. Component and styling boundaries

- `ReadingView` and its accessibility stylesheet own explicit dialog centering and internal overflow.
- `Cover` retains the existing four-phase state machine and transition-settlement safeguards. Its open phase changes presentation and interactivity, not state ownership.
- `Scrapbook` continues to own cover/page state and focus movement.
- Responsive book geometry remains in the scrapbook stylesheet.
- Mobile contribution placement remains in the existing typed recipe files and shared layout stylesheet; no new card system or alternate mobile DOM tree is introduced.
- No content-model, placeholder, photo-path, hosting, dependency, or deployment changes are required.

## 6. Accessibility and interaction safeguards

- The open cover remains `aria-hidden`, untabbable, and pointer-inert while still visible.
- Closed-cover keyboard activation and focus movement into the opened pages remain unchanged.
- Closing the cover restores focus to the closed-cover control.
- The centered dialog remains a native modal with Escape support, backdrop close, initial close-button focus, focus trapping, and trigger focus restoration.
- The dialog's internal scroll region remains keyboard focusable.
- Controls retain at least 44 × 44 CSS-pixel touch targets.
- Pinch zoom remains enabled; only accidental double-tap zoom is suppressed.
- Reduced-motion mode retains all navigation and cover states without large rotation.

## 7. Edge cases

- A viewport resize or rotation preserves the current logical memory and recalculates the canvas without jumping to page one.
- A cover transition interrupted by reduced-motion changes or resizing still resolves through transition events or the existing fallback timer.
- A very long message remains contained within the centered reading paper and never enlarges the document viewport.
- The retained cover never raises the document's scroll width; overflow is clipped by the experience viewport rather than creating horizontal scrolling.
- Narrow devices keep note triggers and navigation controls reachable even when their mobile recipe is vertically rebalanced.

## 8. Verification

No unit tests will be created or run, per project requirement.

Verification consists of:

- a clean TypeScript and Vite production build under Node 22.12;
- source review confirming no content, dependency, test, hosting, or deployment changes;
- desktop review at 1440 × 900 for centered dialogs and the broad retained cover;
- portrait review at 390 × 844 and 320 × 568 for the taller canvas, all 15 recipes, controls, safe areas, and absence of document scrolling;
- short mobile-landscape review for height-constrained geometry;
- cover open/close, page buttons, keyboard navigation, edge taps, horizontal swipes, note taps, Escape, and focus restoration;
- double-tap behavior, two-finger pinch zoom, and long-letter internal scrolling on a touch-capable browser;
- reduced-motion cover and page navigation;
- console and network review for runtime errors or failed placeholder requests.

If browser automation remains unavailable, browser-only checks must be reported as unverified rather than inferred from source or build output.

## 9. Success criteria

The change is successful when:

- every enlarged letter is centered;
- the blue cover remains visibly and physically attached after opening on desktop and mobile;
- the retained cover never blocks interaction;
- portrait mobile uses most of the vertical viewport without cropping or stacking the scrapbook;
- all 15 mobile recipes still feel individually art-directed;
- the scrapbook has no page-level mobile scrolling;
- double taps do not unexpectedly zoom, while pinch zoom still works;
- long letters remain readable through internal scrolling;
- the production build passes and the worktree contains no unrelated changes.

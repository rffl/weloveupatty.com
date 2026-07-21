# iOS Safari Forward Page-Turn Paint Fix

**Date:** 2026-07-21

## Goal

Make the mobile Next button show the same physical page-turn animation in iOS Safari that already works for Back, without changing desktop motion, finger-driven swipes, page-stack ownership, cover layering, or navigation timing.

## Root cause

Automatic mobile Next conditionally mounts a turning leaf and immediately animates it from `rotateY(0deg)` to `rotateY(-178deg)`. Because the leaf has no explicit base transform, its pre-animation state is `transform: none`. iOS WebKit can fail to paint a transform animation that begins from that state. Automatic Back avoids the failure because its first frame is the explicit non-identity transform `rotateY(-178deg)`.

This matches the behavior documented in WebKit bug 260981: an explicit identity transform paints correctly where an animation beginning from `transform: none` may not.

## Approved design

The settling state will carry its existing input source (`automatic` or `gesture`) as explicit metadata. For an automatic mobile turn settling forward toward its destination from zero progress, `PageTurner` will synchronously apply the exact start state, then wait across two `requestAnimationFrame` callbacks before starting the existing animations. This gives the newly mounted identity leaf one real paint boundary before WebKit promotes and animates it.

The warm-up animation fill mode will be `both`, preserving the initialized first frame while animation playback is pending. Both scheduled frame callbacks will be stored and cancelled by effect cleanup so a mode change, resize, unmount, or superseding turn cannot start a stale animation.

Gesture settlements will start immediately because their leaf has already been painted while following the finger. Desktop and automatic Back behavior will remain on their existing path.

## Scope boundaries

- Do not change page indices, navigation semantics, angle calculations, easing, or the approved desktop/mobile durations. The added input-source field is metadata used only to select the paint warm-up path.
- Do not change the destination layer's depth or the retained page-stack/cover stacking model.
- Do not add browser detection; the paint initialization is standards-compatible and narrowly gated by turn state.
- Do not add unit tests, per the project requirement.

## Verification

- Run `npm run build` and `git diff --check`.
- Confirm statically that both pending animation frames are cancelled during cleanup.
- Real-device review should cover Next, Back, rapid alternating taps, the opening-to-first-contribution turn, middle pages with retained history, and a finger-driven swipe settlement on iOS Safari.

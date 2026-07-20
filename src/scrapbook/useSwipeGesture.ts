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

  const elapsedMs = earliest ? currentTime - earliest.time : 0;

  if (!earliest || !Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return 0;
  }

  const signedVelocity = (currentX - earliest.x) / elapsedMs;

  if (!Number.isFinite(signedVelocity)) {
    return 0;
  }

  return direction === "forward" ? -signedVelocity : signedVelocity;
}

export function useSwipeGesture({
  enabled,
  directManipulationEnabled,
  onDragStart,
  onDragProgress,
  onDragRelease,
  onDragCancel,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions) {
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

  function resetPointer() {
    pointerId.current = null;
    startX.current = 0;
    startY.current = 0;
    surfaceWidth.current = 1;
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

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    if (pointerId.current !== null) {
      return;
    }

    suppressNextClick.current = false;

    if (!enabled || isInteractiveTarget(event.target)) {
      return;
    }

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
}

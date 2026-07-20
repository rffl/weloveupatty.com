import { useRef, useState } from "react";
import type { PointerEventHandler } from "react";

type SwipeGestureOptions = {
  enabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const swipeThreshold = 56;
const maximumDrag = 130;
const clickSuppressionDistance = 8;

const interactiveElementSelector =
  "button, a, dialog, input, textarea, select";

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(interactiveElementSelector) !== null
  );
}

export function useSwipeGesture({
  enabled,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions) {
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const didDrag = useRef(false);
  const suppressNextClick = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function resetPointer() {
    pointerId.current = null;
    didDrag.current = false;
    setDragOffset(0);
    setIsDragging(false);
  }

  function rememberDrag(horizontal: number, vertical: number) {
    if (Math.hypot(horizontal, vertical) > clickSuppressionDistance) {
      didDrag.current = true;
    }
  }

  function preserveClickSuppression() {
    if (didDrag.current) {
      suppressNextClick.current = true;
    }
  }

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    suppressNextClick.current = false;

    if (!enabled || isInteractiveTarget(event.target)) {
      return;
    }

    didDrag.current = false;
    pointerId.current = event.pointerId;
    startX.current = event.clientX;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }

    const horizontal = event.clientX - startX.current;
    const vertical = event.clientY - startY.current;
    rememberDrag(horizontal, vertical);

    if (Math.abs(vertical) > Math.abs(horizontal) && Math.abs(vertical) > 12) {
      preserveClickSuppression();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      resetPointer();
      return;
    }

    setDragOffset(Math.max(-maximumDrag, Math.min(maximumDrag, horizontal)));
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }

    const horizontal = event.clientX - startX.current;
    const vertical = event.clientY - startY.current;
    rememberDrag(horizontal, vertical);
    preserveClickSuppression();

    if (horizontal <= -swipeThreshold) {
      onSwipeLeft();
    } else if (horizontal >= swipeThreshold) {
      onSwipeRight();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetPointer();
  };

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current === event.pointerId) {
      preserveClickSuppression();
      resetPointer();
    }
  };

  const onLostPointerCapture: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current === event.pointerId) {
      preserveClickSuppression();
      resetPointer();
    }
  };

  function consumeClickSuppression(pointerOriginated: boolean): boolean {
    const shouldSuppress = suppressNextClick.current;
    suppressNextClick.current = false;
    return pointerOriginated && shouldSuppress;
  }

  return {
    dragOffset,
    isDragging,
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

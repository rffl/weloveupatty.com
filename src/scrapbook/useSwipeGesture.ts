import { useRef, useState } from "react";
import type { PointerEventHandler } from "react";

type SwipeGestureOptions = {
  enabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const swipeThreshold = 56;
const maximumDrag = 130;

export function useSwipeGesture({
  enabled,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions) {
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function reset() {
    pointerId.current = null;
    setDragOffset(0);
    setIsDragging(false);
  }

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as Element;

    if (
      !enabled ||
      !event.isPrimary ||
      event.button !== 0 ||
      target.closest("button, a, dialog, input, textarea, select")
    ) {
      return;
    }

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

    if (Math.abs(vertical) > Math.abs(horizontal) && Math.abs(vertical) > 12) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      reset();
      return;
    }

    setDragOffset(Math.max(-maximumDrag, Math.min(maximumDrag, horizontal)));
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }

    const horizontal = event.clientX - startX.current;

    if (horizontal <= -swipeThreshold) {
      onSwipeLeft();
    } else if (horizontal >= swipeThreshold) {
      onSwipeRight();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    reset();
  };

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current === event.pointerId) {
      reset();
    }
  };

  const onLostPointerCapture: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current === event.pointerId) {
      reset();
    }
  };

  return {
    dragOffset,
    isDragging,
    gestureProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
  };
}

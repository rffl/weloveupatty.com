import { useLayoutEffect, useRef } from "react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

import type { TurnDirection } from "./usePageTurner";
import { desktopMediaQuery } from "./useResponsiveMode";
import { isInteractiveTarget, useSwipeGesture } from "./useSwipeGesture";

type PageTurnerProps = {
  children: ReactNode;
  outgoingContent: ReactNode | null;
  retainStationaryHalf: boolean;
  enabled: boolean;
  isTurning: boolean;
  direction: TurnDirection | null;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTurnComplete: () => void;
};

type DragStyle = CSSProperties & { "--drag-offset": string };

const minimumPageEdge = 44;

export function PageTurner({
  children,
  outgoingContent,
  retainStationaryHalf,
  enabled,
  isTurning,
  direction,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onTurnComplete,
}: PageTurnerProps) {
  const turningLeaf = useRef<HTMLDivElement>(null);
  const { dragOffset, isDragging, consumeClickSuppression, gestureProps } =
    useSwipeGesture({
      enabled: enabled && !isTurning,
      onSwipeLeft: onNext,
      onSwipeRight: onPrevious,
    });
  const style: DragStyle = { "--drag-offset": `${dragOffset}px` };

  useLayoutEffect(() => {
    const leaf = turningLeaf.current;

    if (!leaf || !isTurning) {
      return;
    }

    let completed = false;
    const complete = (event: AnimationEvent) => {
      if (!completed && event.target === leaf) {
        completed = true;
        onTurnComplete();
      }
    };

    leaf.addEventListener("animationend", complete);
    leaf.addEventListener("animationcancel", complete);

    return () => {
      leaf.removeEventListener("animationend", complete);
      leaf.removeEventListener("animationcancel", complete);
    };
  }, [direction, isTurning, onTurnComplete]);

  const onSurfaceClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    if (consumeClickSuppression(event.detail !== 0)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onSurfaceClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!enabled || isTurning || isInteractiveTarget(event.target)) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const desktop = window.matchMedia(desktopMediaQuery).matches;
    const horizontalInset = Math.max(
      minimumPageEdge,
      bounds.width * (desktop ? 0.07 : 0.09),
    );
    const verticalInset = bounds.height * (desktop ? 0.09 : 0.12);
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (y < verticalInset || y > bounds.height - verticalInset) {
      return;
    }

    if (x <= horizontalInset && canPrevious) {
      onPrevious();
    } else if (x >= bounds.width - horizontalInset && canNext) {
      onNext();
    }
  };

  return (
    <div
      className="page-turner"
      data-dragging={isDragging || undefined}
      data-turn={direction ?? undefined}
      onClick={onSurfaceClick}
      onClickCapture={onSurfaceClickCapture}
      style={style}
      {...gestureProps}
    >
      <div
        aria-hidden={isTurning || undefined}
        className="page-turner__content"
        inert={isTurning}
      >
        {children}
      </div>
      {isTurning ? (
        <>
          {retainStationaryHalf ? (
            <div
              aria-hidden="true"
              className="page-turner__stationary-outgoing"
              inert
            >
              <div className="page-turner__outgoing-composition">
                {outgoingContent}
              </div>
            </div>
          ) : null}
          <div
            aria-hidden="true"
            className="page-turner__turning-leaf"
            inert
            ref={turningLeaf}
          >
            <div className="page-turner__leaf-face page-turner__leaf-face--front">
              <div className="page-turner__outgoing-composition">
                {outgoingContent}
              </div>
            </div>
            <div className="page-turner__leaf-face page-turner__leaf-face--back" />
          </div>
        </>
      ) : null}
    </div>
  );
}

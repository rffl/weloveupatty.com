import type { CSSProperties, ReactNode } from "react";

import type { TurnDirection } from "./usePageTurner";
import { useSwipeGesture } from "./useSwipeGesture";

type PageTurnerProps = {
  children: ReactNode;
  enabled: boolean;
  isTurning: boolean;
  direction: TurnDirection | null;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

type DragStyle = CSSProperties & { "--drag-offset": string };

export function PageTurner({
  children,
  enabled,
  isTurning,
  direction,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: PageTurnerProps) {
  const { dragOffset, isDragging, gestureProps } = useSwipeGesture({
    enabled: enabled && !isTurning,
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });
  const style: DragStyle = { "--drag-offset": `${dragOffset}px` };

  return (
    <div
      className="page-turner"
      data-dragging={isDragging || undefined}
      data-turn={direction ?? undefined}
      style={style}
      {...gestureProps}
    >
      <div className="page-turner__content">{children}</div>
      {isTurning ? (
        <span className="page-turner__turning-leaf" aria-hidden="true" />
      ) : null}
      <button
        className="page-turner__edge page-turner__edge--previous"
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious || isTurning}
        aria-label="Turn to the previous scrapbook page"
      />
      <button
        className="page-turner__edge page-turner__edge--next"
        type="button"
        onClick={onNext}
        disabled={!canNext || isTurning}
        aria-label="Turn to the next scrapbook page"
      />
    </div>
  );
}

import { useCallback, useLayoutEffect, useRef } from "react";
import type { MouseEventHandler, ReactNode } from "react";

import type { ResponsiveMode } from "../layouts/types";
import {
  turnAngleDegrees,
  turnDepth,
  turnEasing,
} from "./pageTurnMotion";
import type {
  GestureRelease,
  PageTurnState,
  TurnDirection,
  TurnSnapshot,
} from "./pageTurnMotion";
import { isInteractiveTarget, useSwipeGesture } from "./useSwipeGesture";

const desktopBackwardLiftProgress = 0.1;
const desktopForwardTuckProgress = 0.9;

function turningLeafZIndex(input: {
  mode: ResponsiveMode;
  direction: TurnDirection;
  progress: number;
}): number {
  if (input.mode !== "desktop") {
    return 40;
  }

  const tuckedUnderBinding =
    input.direction === "forward"
      ? input.progress >= desktopForwardTuckProgress
      : input.progress <= desktopBackwardLiftProgress;

  return tuckedUnderBinding ? 38 : 40;
}

export type ParkedPageLayer = Readonly<{
  pageIndex: number;
  content: ReactNode;
}>;

type PageTurnerProps = {
  children: ReactNode;
  sourceContent: ReactNode | null;
  destinationContent: ReactNode | null;
  parkedPageStack: readonly ParkedPageLayer[];
  parkedHistoryCount: number;
  mode: ResponsiveMode;
  reducedMotion: boolean;
  enabled: boolean;
  isBusy: boolean;
  turnState: PageTurnState;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onDragStart: (direction: TurnDirection) => TurnSnapshot | null;
  onDragProgress: (turnId: number, progress: number) => void;
  onDragRelease: (release: GestureRelease) => void;
  onDragCancel: (turnId: number, progress: number) => void;
  onTurnComplete: (turnId: number) => void;
  onLayoutChange: () => void;
};

export function PageTurner({
  children,
  sourceContent,
  destinationContent,
  parkedPageStack,
  parkedHistoryCount,
  mode,
  reducedMotion,
  enabled,
  isBusy,
  turnState,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onDragStart,
  onDragProgress,
  onDragRelease,
  onDragCancel,
  onTurnComplete,
  onLayoutChange,
}: PageTurnerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const castShadowRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const shadingRef = useRef<HTMLSpanElement>(null);
  const gutterShadeRef = useRef<HTMLSpanElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const visualProgress = useRef(0);
  const gestureDirection = useRef<TurnDirection | null>(null);
  const visualFrame = useRef<number | null>(null);
  const pendingVisual = useRef<{
    progress: number;
    direction: TurnDirection;
  } | null>(null);
  const runningAnimations = useRef<Animation[]>([]);
  const previousInteractionContext = useRef({ mode, reducedMotion });

  const applyProgress = useCallback(
    (progress: number, direction: TurnDirection) => {
      visualProgress.current = progress;

      if (reducedMotion) {
        return;
      }

      const leaf = leafRef.current;
      const castShadow = castShadowRef.current;
      const edge = edgeRef.current;
      const shading = shadingRef.current;
      const gutterShade = gutterShadeRef.current;
      const angle = turnAngleDegrees({ mode, direction, progress });
      const depth = turnDepth(progress);

      if (leaf) {
        leaf.style.transform = `rotateY(${angle}deg)`;
        leaf.style.zIndex = `${turningLeafZIndex({
          mode,
          direction,
          progress,
        })}`;
      }
      if (castShadow) {
        castShadow.style.opacity = `${depth * 0.48}`;
        castShadow.style.transform = `scaleX(${0.24 + depth * 0.76})`;
      }
      if (edge) {
        edge.style.opacity = `${depth * 0.82}`;
      }
      if (shading) {
        shading.style.opacity = `${0.16 + depth * 0.46}`;
        shading.style.transform =
          `translateZ(0.4px) scaleX(${0.78 + depth * 0.22})`;
      }
      if (gutterShade) {
        gutterShade.style.opacity = `${depth * 0.42}`;
        gutterShade.style.transform = `scaleX(${0.35 + depth * 0.65})`;
      }
    },
    [mode, reducedMotion],
  );

  const scheduleProgress = useCallback(
    (progress: number, direction: TurnDirection) => {
      visualProgress.current = progress;
      pendingVisual.current = { progress, direction };

      if (visualFrame.current !== null) {
        return;
      }

      visualFrame.current = window.requestAnimationFrame(() => {
        visualFrame.current = null;
        const nextVisual = pendingVisual.current;
        pendingVisual.current = null;

        if (nextVisual) {
          applyProgress(nextVisual.progress, nextVisual.direction);
        }
      });
    },
    [applyProgress],
  );

  useLayoutEffect(() => {
    return () => {
      if (visualFrame.current !== null) {
        window.cancelAnimationFrame(visualFrame.current);
      }
      runningAnimations.current.forEach((animation) => animation.cancel());
      visualFrame.current = null;
      pendingVisual.current = null;
      runningAnimations.current = [];
    };
  }, []);

  const {
    isTracking,
    cancelTracking,
    consumeClickSuppression,
    gestureProps,
  } =
    useSwipeGesture({
      enabled,
      directManipulationEnabled: turnState.phase === "idle",
      mode,
      onDragStart: (direction) => {
        const turn = onDragStart(direction);

        if (turn) {
          gestureDirection.current = direction;
        }

        return turn;
      },
      onDragProgress: (turnId, progress) => {
        visualProgress.current = progress;
        onDragProgress(turnId, progress);

        const direction =
          turnState.phase === "idle"
            ? gestureDirection.current
            : turnState.turn.direction;

        if (direction) {
          scheduleProgress(progress, direction);
        }
      },
      onDragRelease,
      onDragCancel,
      onSwipeLeft: onNext,
      onSwipeRight: onPrevious,
    });

  useLayoutEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    let previousSize: { width: number; height: number } | null = null;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };

      if (previousSize) {
        const widthChange =
          Math.abs(nextSize.width - previousSize.width) /
          Math.max(1, previousSize.width);
        const heightChange =
          Math.abs(nextSize.height - previousSize.height) /
          Math.max(1, previousSize.height);

        if (Math.max(widthChange, heightChange) >= 0.04) {
          cancelTracking();
          onLayoutChange();
        }
      }

      previousSize = nextSize;
    });

    observer.observe(surface);
    return () => observer.disconnect();
  }, [cancelTracking, onLayoutChange]);

  useLayoutEffect(() => {
    const previous = previousInteractionContext.current;
    previousInteractionContext.current = { mode, reducedMotion };

    if (
      previous.mode !== mode ||
      previous.reducedMotion !== reducedMotion
    ) {
      cancelTracking();
    }
  }, [cancelTracking, mode, reducedMotion]);

  useLayoutEffect(() => {
    if (visualFrame.current !== null) {
      window.cancelAnimationFrame(visualFrame.current);
      visualFrame.current = null;
      pendingVisual.current = null;
    }

    runningAnimations.current.forEach((animation) => animation.cancel());
    runningAnimations.current = [];

    if (turnState.phase !== "settling") {
      return;
    }

    const { turn, settleTarget, startProgress, durationMs } = turnState;
    const destinationProgress = settleTarget === "destination" ? 1 : 0;
    let completed = false;

    const complete = () => {
      if (!completed) {
        completed = true;
        onTurnComplete(turn.id);
      }
    };

    if (reducedMotion) {
      if (settleTarget === "source") {
        const frame = window.requestAnimationFrame(complete);
        return () => window.cancelAnimationFrame(frame);
      }

      const destination = destinationRef.current;

      if (!destination) {
        complete();
        return;
      }

      const animation = destination.animate(
        [
          { opacity: 0, transform: "translateY(1px) scale(0.996)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: durationMs, easing: "ease-out", fill: "forwards" },
      );
      runningAnimations.current = [animation];
      animation.finished.then(complete).catch(() => undefined);
      return () => {
        animation.cancel();
        runningAnimations.current = [];
      };
    }

    if (Math.abs(destinationProgress - startProgress) < 0.001) {
      applyProgress(destinationProgress, turn.direction);
      const frame = window.requestAnimationFrame(complete);
      return () => window.cancelAnimationFrame(frame);
    }

    const leaf = leafRef.current;
    const castShadow = castShadowRef.current;
    const edge = edgeRef.current;
    const shading = shadingRef.current;
    const gutterShade = gutterShadeRef.current;

    if (!leaf || !castShadow || !edge || !shading || !gutterShade) {
      complete();
      return;
    }

    const transitionProgress =
      mode !== "desktop"
        ? []
        : turn.direction === "forward"
          ? [
              desktopForwardTuckProgress - 0.001,
              desktopForwardTuckProgress + 0.001,
            ]
          : [
              desktopBackwardLiftProgress - 0.001,
              desktopBackwardLiftProgress + 0.001,
            ];
    const candidates = [0.5, ...transitionProgress].filter(
      (progress) =>
        progress > Math.min(startProgress, destinationProgress) &&
        progress < Math.max(startProgress, destinationProgress),
    );
    candidates.sort((a, b) =>
      destinationProgress > startProgress ? a - b : b - a,
    );
    const progressStops = [
      startProgress,
      ...candidates,
      destinationProgress,
    ];

    const offsetFor = (progress: number) => {
      const distance = Math.abs(destinationProgress - startProgress);
      return distance === 0
        ? 1
        : Math.abs(progress - startProgress) / distance;
    };
    const leafFrames = progressStops.map((progress) => ({
      offset: offsetFor(progress),
      transform: `rotateY(${turnAngleDegrees({
        mode,
        direction: turn.direction,
        progress,
      })}deg)`,
      zIndex: `${turningLeafZIndex({
        mode,
        direction: turn.direction,
        progress,
      })}`,
    }));
    const depthFrames = progressStops.map((progress) => ({
      offset: offsetFor(progress),
      opacity: turnDepth(progress) * 0.48,
      transform: `scaleX(${0.24 + turnDepth(progress) * 0.76})`,
    }));
    const edgeFrames = progressStops.map((progress) => ({
      offset: offsetFor(progress),
      opacity: turnDepth(progress) * 0.82,
    }));
    const shadingFrames = progressStops.map((progress) => ({
      offset: offsetFor(progress),
      opacity: 0.16 + turnDepth(progress) * 0.46,
      transform:
        `translateZ(0.4px) scaleX(${0.78 + turnDepth(progress) * 0.22})`,
    }));
    const gutterFrames = progressStops.map((progress) => ({
      offset: offsetFor(progress),
      opacity: turnDepth(progress) * 0.42,
      transform: `scaleX(${0.35 + turnDepth(progress) * 0.65})`,
    }));
    const options: KeyframeAnimationOptions = {
      duration: durationMs,
      easing: turnEasing,
      fill: "forwards",
    };
    const leafAnimation = leaf.animate(leafFrames, options);
    const shadowAnimation = castShadow.animate(depthFrames, options);
    const edgeAnimation = edge.animate(edgeFrames, options);
    const shadingAnimation = shading.animate(shadingFrames, options);
    const gutterAnimation = gutterShade.animate(gutterFrames, options);
    runningAnimations.current = [
      leafAnimation,
      shadowAnimation,
      edgeAnimation,
      shadingAnimation,
      gutterAnimation,
    ];
    leafAnimation.finished.then(complete).catch(() => undefined);

    return () => {
      runningAnimations.current.forEach((animation) => animation.cancel());
      runningAnimations.current = [];
    };
  }, [applyProgress, mode, onTurnComplete, reducedMotion, turnState]);

  useLayoutEffect(() => {
    if (turnState.phase === "dragging") {
      scheduleProgress(visualProgress.current, turnState.turn.direction);
    }
  }, [scheduleProgress, turnState]);

  const onSurfaceClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    if (consumeClickSuppression(event.detail !== 0)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onSurfaceClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (
      !enabled ||
      turnState.phase === "dragging" ||
      isInteractiveTarget(event.target)
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const desktop = mode === "desktop";
    const horizontalInset = desktop
      ? Math.max(44, bounds.width * 0.07)
      : Math.min(64, Math.max(52, bounds.width * 0.11));
    const verticalInset = bounds.height * (desktop ? 0.09 : 0.12);
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
      return;
    }

    if (y < verticalInset || y > bounds.height - verticalInset) {
      return;
    }

    if (x <= horizontalInset && canPrevious) {
      onPrevious();
    } else if (x >= bounds.width - horizontalInset && canNext) {
      onNext();
    }
  };

  const activeTurn = turnState.phase === "idle" ? null : turnState.turn;
  const showParkedStack =
    mode === "mobile" && parkedPageStack.length > 0;
  const showParkedGrabZone = showParkedStack && activeTurn === null;
  const direction = activeTurn?.direction;
  const mobileBackward = mode === "mobile" && direction === "backward";
  const leafFrontContent = mobileBackward
    ? destinationContent
    : sourceContent;
  const leafBackContent =
    mode === "desktop" || mobileBackward
      ? destinationContent
      : sourceContent;

  return (
    <div
      className="page-turner"
      data-busy={isBusy || undefined}
      data-mode={mode}
      data-reduced-motion={reducedMotion || undefined}
      data-tracking={isTracking || undefined}
      data-turn={direction}
      onClick={onSurfaceClick}
      onClickCapture={onSurfaceClickCapture}
      ref={surfaceRef}
      {...gestureProps}
    >
      {showParkedStack ? (
        <>
          <div
            aria-hidden="true"
            className="page-turner__parked-stack"
            data-has-deeper-history={
              parkedHistoryCount > parkedPageStack.length || undefined
            }
            inert
          >
            {parkedHistoryCount > parkedPageStack.length ? (
              <span className="page-turner__parked-depth" />
            ) : null}
            {parkedPageStack.map((page, index) => {
              const depth = parkedPageStack.length - index - 1;

              return (
                <div
                  className="page-turner__parked-leaf"
                  data-stack-depth={depth}
                  key={page.pageIndex}
                >
                  <div
                    className="page-turner__leaf-face page-turner__leaf-face--back"
                    data-paper-back
                  >
                    <div className="page-turner__visual-composition">
                      {page.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showParkedGrabZone ? (
            <span
              aria-hidden="true"
              className="page-turner__parked-grab-zone"
            />
          ) : null}
        </>
      ) : null}

      <div
        aria-hidden={isBusy || undefined}
        className="page-turner__content"
        inert={isBusy}
      >
        {children}
      </div>

      {mode === "desktop" || activeTurn ? (
        <div aria-hidden="true" className="page-turner__scene" inert>
          {mode === "desktop" ? (
            <span className="page-turner__scene-spine" />
          ) : null}
          {activeTurn ? (
            <>
              <div className="page-turner__destination" ref={destinationRef}>
                {destinationContent}
              </div>

              {mode === "desktop" ? (
                <div className="page-turner__stationary-source">
                  <div className="page-turner__visual-composition">
                    {sourceContent}
                  </div>
                </div>
              ) : null}

              <span
                className="page-turner__cast-shadow"
                ref={castShadowRef}
              />
              <span
                className="page-turner__gutter-shade"
                ref={gutterShadeRef}
              />

              <div className="page-turner__turning-leaf" ref={leafRef}>
                <div className="page-turner__leaf-face page-turner__leaf-face--front">
                  <div className="page-turner__visual-composition">
                    {leafFrontContent}
                  </div>
                </div>
                <div
                  className="page-turner__leaf-face page-turner__leaf-face--back"
                  data-paper-back={mode === "mobile" || undefined}
                >
                  <div className="page-turner__visual-composition">
                    {leafBackContent}
                  </div>
                </div>
                <span
                  className="page-turner__leaf-shading"
                  ref={shadingRef}
                />
                <span className="page-turner__leaf-edge" ref={edgeRef} />
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { ResponsiveMode } from "../layouts/types";
import { desktopSpreadForPageIndex } from "./pageModel";
import {
  adjacentPageIndex,
  clampProgress,
  fallbackDelayMs,
  idlePageTurnState,
  settleDurationMs,
  shouldCommitSwipe,
} from "./pageTurnMotion";
import type {
  GestureRelease,
  PageTurnState,
  PendingTurnIntent,
  TurnDirection,
  TurnInputSource,
  TurnSettleTarget,
  TurnSnapshot,
} from "./pageTurnMotion";

export type { TurnDirection, TurnSnapshot } from "./pageTurnMotion";

export type PreviousAction =
  | "ignored"
  | "page-turn-started"
  | "page-turn-queued"
  | "cover-closed";

type PageTurnerOptions = {
  pageCount: number;
  mode: ResponsiveMode;
  reducedMotion: boolean;
};

export function usePageTurner({
  pageCount,
  mode,
  reducedMotion,
}: PageTurnerOptions) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [turnState, setTurnState] =
    useState<PageTurnState>(idlePageTurnState);
  const [pendingIntent, setPendingIntent] =
    useState<PendingTurnIntent | null>(null);
  const coverOpenRef = useRef(false);
  const activePageIndexRef = useRef(0);
  const turnStateRef = useRef<PageTurnState>(idlePageTurnState);
  const pendingIntentRef = useRef<PendingTurnIntent | null>(null);
  const turnProgressRef = useRef(0);
  const nextTurnId = useRef(0);
  const fallbackTimer = useRef<number | null>(null);
  const pendingLaunchFrame = useRef<number | null>(null);
  const resolveTurnRef = useRef<
    (turnId: number, launchPending: boolean) => void
  >(() => undefined);
  const requestDirectionRef = useRef<
    (direction: TurnDirection) => "ignored" | "started" | "queued"
  >(() => "ignored");
  const previousMode = useRef(mode);
  const previousReducedMotion = useRef(reducedMotion);
  const lastPageIndex = Math.max(0, pageCount - 1);
  const desktopSpreadCount = 1 + Math.ceil(Math.max(0, pageCount - 1) / 2);

  const publishTurnState = useCallback((nextState: PageTurnState) => {
    turnStateRef.current = nextState;
    setTurnState(nextState);
  }, []);

  const publishPendingIntent = useCallback(
    (intent: PendingTurnIntent | null) => {
      pendingIntentRef.current = intent;
      setPendingIntent(intent);
    },
    [],
  );

  const clearFallback = useCallback(() => {
    if (fallbackTimer.current !== null) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }, []);

  const clearPendingLaunch = useCallback(() => {
    if (pendingLaunchFrame.current !== null) {
      window.cancelAnimationFrame(pendingLaunchFrame.current);
      pendingLaunchFrame.current = null;
    }
  }, []);

  const commitPageIndex = useCallback((pageIndex: number) => {
    activePageIndexRef.current = pageIndex;
    setActivePageIndex(pageIndex);
  }, []);

  const armFallback = useCallback(
    (turnId: number, durationMs: number) => {
      clearFallback();
      fallbackTimer.current = window.setTimeout(() => {
        resolveTurnRef.current(turnId, true);
      }, fallbackDelayMs(durationMs));
    },
    [clearFallback],
  );

  const beginAutomaticTurn = useCallback(
    (
      sourcePageIndex: number,
      destinationPageIndex: number,
      direction: TurnDirection,
    ) => {
      const turn: TurnSnapshot = {
        id: nextTurnId.current + 1,
        direction,
        sourcePageIndex,
        destinationPageIndex,
        canCommit: true,
        mode,
      };
      nextTurnId.current = turn.id;

      const durationMs = settleDurationMs({
        source: "automatic",
        direction: turn.direction,
        settleTarget: "destination",
        startProgress: 0,
        velocityPxPerMs: 0,
        reducedMotion,
        mode: turn.mode,
      });
      turnProgressRef.current = 0;
      publishTurnState({
        phase: "settling",
        turn,
        inputSource: "automatic",
        settleTarget: "destination",
        startProgress: 0,
        durationMs,
      });
      armFallback(turn.id, durationMs);
    },
    [armFallback, mode, publishTurnState, reducedMotion],
  );

  const adjacentFrom = useCallback(
    (pageIndex: number, direction: TurnDirection) =>
      adjacentPageIndex({
        currentPageIndex: pageIndex,
        direction,
        mode,
        pageCount,
      }),
    [mode, pageCount],
  );

  const projectedBaseIndex = useCallback(() => {
    const current = turnStateRef.current;

    if (current.phase === "idle") {
      return activePageIndexRef.current;
    }

    if (
      current.phase === "settling" &&
      current.settleTarget === "destination"
    ) {
      return current.turn.destinationPageIndex;
    }

    return current.turn.sourcePageIndex;
  }, []);

  const queueDirection = useCallback(
    (direction: TurnDirection): "ignored" | "queued" => {
      if (turnStateRef.current.phase === "dragging") {
        return "ignored";
      }

      const targetPageIndex = adjacentFrom(projectedBaseIndex(), direction);

      if (targetPageIndex === null) {
        return "ignored";
      }

      publishPendingIntent({ direction, targetPageIndex });
      return "queued";
    },
    [adjacentFrom, projectedBaseIndex, publishPendingIntent],
  );

  const requestDirection = useCallback(
    (direction: TurnDirection): "ignored" | "started" | "queued" => {
      if (
        turnStateRef.current.phase !== "idle" ||
        pendingIntentRef.current !== null
      ) {
        return queueDirection(direction);
      }

      const sourcePageIndex = activePageIndexRef.current;
      const destinationPageIndex = adjacentFrom(sourcePageIndex, direction);

      if (destinationPageIndex === null) {
        return "ignored";
      }

      beginAutomaticTurn(sourcePageIndex, destinationPageIndex, direction);
      return "started";
    },
    [adjacentFrom, beginAutomaticTurn, queueDirection],
  );

  useLayoutEffect(() => {
    requestDirectionRef.current = requestDirection;
  }, [requestDirection]);

  const beginDrag = useCallback(
    (direction: TurnDirection): TurnSnapshot | null => {
      if (
        !coverOpenRef.current ||
        turnStateRef.current.phase !== "idle" ||
        pendingIntentRef.current !== null
      ) {
        return null;
      }

      const sourcePageIndex = activePageIndexRef.current;
      const destinationPageIndex = adjacentFrom(sourcePageIndex, direction);

      if (destinationPageIndex === null) {
        return null;
      }

      const turn: TurnSnapshot = {
        id: nextTurnId.current + 1,
        direction,
        sourcePageIndex,
        destinationPageIndex,
        canCommit: true,
        mode,
      };
      nextTurnId.current = turn.id;
      turnProgressRef.current = 0;
      publishTurnState({ phase: "dragging", turn });
      return turn;
    },
    [adjacentFrom, mode, publishTurnState],
  );

  const updateDrag = useCallback((turnId: number, progress: number) => {
    const current = turnStateRef.current;

    if (current.phase === "dragging" && current.turn.id === turnId) {
      turnProgressRef.current = clampProgress(progress);
    }
  }, []);

  const settleDrag = useCallback(
    (
      release: GestureRelease,
      settleTarget: TurnSettleTarget,
      source: TurnInputSource = "gesture",
    ) => {
      const current = turnStateRef.current;

      if (current.phase !== "dragging" || current.turn.id !== release.turnId) {
        return;
      }

      const resolvedTarget =
        settleTarget === "destination" && !current.turn.canCommit
          ? "source"
          : settleTarget;
      const startProgress = clampProgress(release.progress);
      const durationMs = settleDurationMs({
        source,
        direction: current.turn.direction,
        settleTarget: resolvedTarget,
        startProgress,
        velocityPxPerMs: release.velocityTowardDirectionPxPerMs,
        reducedMotion,
        mode: current.turn.mode,
      });
      turnProgressRef.current = startProgress;
      publishTurnState({
        phase: "settling",
        turn: current.turn,
        inputSource: source,
        settleTarget: resolvedTarget,
        startProgress,
        durationMs,
      });
      armFallback(current.turn.id, durationMs);
    },
    [armFallback, publishTurnState, reducedMotion],
  );

  const releaseDrag = useCallback(
    (release: GestureRelease) => {
      settleDrag(
        release,
        shouldCommitSwipe(release) ? "destination" : "source",
      );
    },
    [settleDrag],
  );

  const cancelDrag = useCallback(
    (turnId: number, progress = turnProgressRef.current) => {
      settleDrag(
        {
          turnId,
          progress,
          distanceTowardDirectionPx: 0,
          velocityTowardDirectionPxPerMs: 0,
          horizontalDominant: false,
        },
        "source",
      );
    },
    [settleDrag],
  );

  const resolveTurn = useCallback(
    (turnId: number, launchPending: boolean) => {
      const current = turnStateRef.current;

      if (current.phase === "idle" || current.turn.id !== turnId) {
        return;
      }

      clearFallback();
      clearPendingLaunch();

      const landedPageIndex =
        current.phase === "settling" &&
        current.settleTarget === "destination"
          ? current.turn.destinationPageIndex
          : current.turn.sourcePageIndex;
      commitPageIndex(landedPageIndex);
      turnProgressRef.current = 0;
      publishTurnState(idlePageTurnState);

      if (!launchPending) {
        publishPendingIntent(null);
        return;
      }

      if (pendingIntentRef.current === null) {
        publishPendingIntent(null);
        return;
      }

      pendingLaunchFrame.current = window.requestAnimationFrame(() => {
        pendingLaunchFrame.current = null;
        const nextIntent = pendingIntentRef.current;
        publishPendingIntent(null);

        if (nextIntent) {
          requestDirectionRef.current(nextIntent.direction);
        }
      });
    },
    [
      clearFallback,
      clearPendingLaunch,
      commitPageIndex,
      publishPendingIntent,
      publishTurnState,
    ],
  );

  useLayoutEffect(() => {
    resolveTurnRef.current = resolveTurn;
  }, [resolveTurn]);

  const completeSettle = useCallback((turnId: number) => {
    const current = turnStateRef.current;

    if (current.phase === "settling" && current.turn.id === turnId) {
      resolveTurnRef.current(turnId, true);
    }
  }, []);

  const resolveForLayoutChange = useCallback(() => {
    const current = turnStateRef.current;

    clearPendingLaunch();
    publishPendingIntent(null);

    if (current.phase !== "idle") {
      resolveTurnRef.current(current.turn.id, false);
    }
  }, [clearPendingLaunch, publishPendingIntent]);

  const openCover = useCallback(() => {
    coverOpenRef.current = true;
    setCoverOpen(true);
  }, []);

  const next = useCallback(() => {
    if (!coverOpenRef.current) {
      openCover();
      return;
    }

    requestDirection("forward");
  }, [openCover, requestDirection]);

  const previous = useCallback((): PreviousAction => {
    if (!coverOpenRef.current) {
      return "ignored";
    }

    if (
      turnStateRef.current.phase !== "idle" ||
      pendingIntentRef.current !== null
    ) {
      return requestDirection("backward") === "queued"
        ? "page-turn-queued"
        : "ignored";
    }

    if (activePageIndexRef.current === 0) {
      coverOpenRef.current = false;
      setCoverOpen(false);
      return "cover-closed";
    }

    return requestDirection("backward") === "started"
      ? "page-turn-started"
      : "ignored";
  }, [requestDirection]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (
        turnStateRef.current.phase !== "idle" ||
        pendingIntentRef.current !== null
      ) {
        return;
      }

      const target = Math.max(0, Math.min(lastPageIndex, pageIndex));
      const source = activePageIndexRef.current;

      if (target === source) {
        return;
      }

      if (
        mode === "desktop" &&
        desktopSpreadForPageIndex(target) === desktopSpreadForPageIndex(source)
      ) {
        commitPageIndex(target);
        return;
      }

      beginAutomaticTurn(
        source,
        target,
        target > source ? "forward" : "backward",
      );
    },
    [beginAutomaticTurn, commitPageIndex, lastPageIndex, mode],
  );

  const rememberPage = useCallback(
    (pageIndex: number) => {
      if (
        turnStateRef.current.phase !== "idle" ||
        pendingIntentRef.current !== null
      ) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(lastPageIndex, pageIndex));

      if (nextIndex !== activePageIndexRef.current) {
        commitPageIndex(nextIndex);
      }
    },
    [commitPageIndex, lastPageIndex],
  );

  useLayoutEffect(() => {
    const modeChanged = previousMode.current !== mode;
    const motionChanged = previousReducedMotion.current !== reducedMotion;
    previousMode.current = mode;
    previousReducedMotion.current = reducedMotion;

    if (modeChanged || motionChanged) {
      resolveForLayoutChange();
    }
  }, [mode, reducedMotion, resolveForLayoutChange]);

  useLayoutEffect(() => {
    resolveForLayoutChange();

    const nextIndex = Math.min(activePageIndexRef.current, lastPageIndex);

    if (nextIndex !== activePageIndexRef.current) {
      commitPageIndex(nextIndex);
    }
  }, [commitPageIndex, lastPageIndex, resolveForLayoutChange]);

  useEffect(() => {
    return () => {
      clearFallback();
      clearPendingLaunch();
      pendingIntentRef.current = null;
      turnStateRef.current = idlePageTurnState;
    };
  }, [clearFallback, clearPendingLaunch]);

  useLayoutEffect(() => {
    coverOpenRef.current = coverOpen;
  }, [coverOpen]);

  const navigationBaseIndex = projectedBaseIndex();
  const canNext =
    coverOpen && adjacentFrom(navigationBaseIndex, "forward") !== null;
  const canPrevious =
    coverOpen &&
    (turnState.phase === "idle"
      ? true
      : adjacentFrom(navigationBaseIndex, "backward") !== null);
  const activeStep =
    mode === "desktop"
      ? desktopSpreadForPageIndex(activePageIndex)
      : activePageIndex;
  const totalSteps = mode === "desktop" ? desktopSpreadCount : pageCount;
  const isBusy = turnState.phase !== "idle" || pendingIntent !== null;

  return {
    coverOpen,
    openCover,
    activePageIndex,
    activeStep,
    totalSteps,
    turnState,
    pendingIntent,
    isBusy,
    isDragging: turnState.phase === "dragging",
    isSettling: turnState.phase === "settling",
    canPrevious,
    canNext,
    beginDrag,
    updateDrag,
    releaseDrag,
    cancelDrag,
    completeSettle,
    resolveForLayoutChange,
    next,
    previous,
    goToPage,
    rememberPage,
  };
}

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { ResponsiveMode } from "../layouts/types";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";

export type TurnDirection = "forward" | "backward";
export type PreviousAction =
  | "ignored"
  | "page-turn-started"
  | "cover-closed";

type ActiveTurn = {
  id: number;
  direction: TurnDirection;
};

type PageTurnerOptions = {
  pageCount: number;
  mode: ResponsiveMode;
};

const turnFallbackDelay = 800;

export function usePageTurner({ pageCount, mode }: PageTurnerOptions) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [outgoingPageIndex, setOutgoingPageIndex] = useState<number | null>(
    null,
  );
  const [activeTurn, setActiveTurn] = useState<ActiveTurn | null>(null);
  const coverOpenRef = useRef(false);
  const activePageIndexRef = useRef(0);
  const activeTurnId = useRef<number | null>(null);
  const nextTurnId = useRef(0);
  const transitionTimer = useRef<number | null>(null);
  const previousMode = useRef(mode);
  const lastPageIndex = Math.max(0, pageCount - 1);
  const desktopSpreadCount = 1 + Math.ceil(Math.max(0, pageCount - 1) / 2);

  const finishTurn = useCallback((turnId: number) => {
    if (activeTurnId.current !== turnId) {
      return;
    }

    activeTurnId.current = null;

    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    setActiveTurn((current) => (current?.id === turnId ? null : current));
    setOutgoingPageIndex(null);
  }, []);

  const completeTurn = useCallback(() => {
    const turnId = activeTurnId.current;

    if (turnId !== null) {
      finishTurn(turnId);
    }
  }, [finishTurn]);

  useLayoutEffect(() => {
    if (previousMode.current === mode) {
      return;
    }

    previousMode.current = mode;

    const turnId = activeTurnId.current;

    if (turnId !== null) {
      finishTurn(turnId);
    }
  }, [finishTurn, mode]);

  useLayoutEffect(() => {
    const nextIndex = Math.min(activePageIndexRef.current, lastPageIndex);

    if (nextIndex !== activePageIndexRef.current) {
      activePageIndexRef.current = nextIndex;
      setActivePageIndex(nextIndex);
    }
  }, [lastPageIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
      }

      activeTurnId.current = null;
    };
  }, []);

  const navigateToPage = useCallback(
    (target: number, direction: TurnDirection) => {
      const nextIndex = Math.max(0, Math.min(lastPageIndex, target));

      if (
        activeTurnId.current !== null ||
        nextIndex === activePageIndexRef.current
      ) {
        return;
      }

      const turnId = nextTurnId.current + 1;
      nextTurnId.current = turnId;
      activeTurnId.current = turnId;
      setOutgoingPageIndex(activePageIndexRef.current);
      activePageIndexRef.current = nextIndex;
      setActiveTurn({ id: turnId, direction });
      setActivePageIndex(nextIndex);
      transitionTimer.current = window.setTimeout(() => {
        finishTurn(turnId);
      }, turnFallbackDelay);
    },
    [finishTurn, lastPageIndex],
  );

  const openCover = useCallback(() => {
    coverOpenRef.current = true;
    setCoverOpen(true);
  }, []);

  const next = useCallback(() => {
    if (!coverOpenRef.current) {
      openCover();
      return;
    }

    if (activeTurnId.current !== null) {
      return;
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndexRef.current + 1, "forward");
      return;
    }

    const spread = desktopSpreadForPageIndex(activePageIndexRef.current);

    if (spread >= desktopSpreadCount - 1) {
      return;
    }

    navigateToPage(firstPageIndexForDesktopSpread(spread + 1), "forward");
  }, [desktopSpreadCount, mode, navigateToPage, openCover]);

  const previous = useCallback((): PreviousAction => {
    if (!coverOpenRef.current || activeTurnId.current !== null) {
      return "ignored";
    }

    if (activePageIndexRef.current === 0) {
      coverOpenRef.current = false;
      setCoverOpen(false);
      return "cover-closed";
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndexRef.current - 1, "backward");
      return "page-turn-started";
    }

    const spread = desktopSpreadForPageIndex(activePageIndexRef.current);
    navigateToPage(firstPageIndexForDesktopSpread(spread - 1), "backward");
    return "page-turn-started";
  }, [mode, navigateToPage]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      navigateToPage(
        pageIndex,
        pageIndex >= activePageIndexRef.current ? "forward" : "backward",
      );
    },
    [navigateToPage],
  );

  const rememberPage = useCallback(
    (pageIndex: number) => {
      const nextIndex = Math.max(0, Math.min(lastPageIndex, pageIndex));

      if (activeTurnId.current !== null) {
        return;
      }

      if (nextIndex === activePageIndexRef.current) {
        return;
      }

      activePageIndexRef.current = nextIndex;
      setActivePageIndex(nextIndex);
    },
    [lastPageIndex],
  );

  useLayoutEffect(() => {
    coverOpenRef.current = coverOpen;
  }, [coverOpen]);

  const activeStep =
    mode === "desktop"
      ? desktopSpreadForPageIndex(activePageIndex)
      : activePageIndex;
  const totalSteps = mode === "desktop" ? desktopSpreadCount : pageCount;
  const canNext =
    coverOpen &&
    (mode === "desktop"
      ? activeStep < desktopSpreadCount - 1
      : activePageIndex < lastPageIndex);

  return {
    coverOpen,
    openCover,
    activePageIndex,
    outgoingPageIndex,
    activeStep,
    totalSteps,
    turnDirection: activeTurn?.direction ?? null,
    isTurning: activeTurn !== null,
    canPrevious: coverOpen,
    canNext,
    completeTurn,
    next,
    previous,
    goToPage,
    rememberPage,
  };
}

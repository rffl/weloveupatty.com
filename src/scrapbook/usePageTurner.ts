import { useCallback, useEffect, useRef, useState } from "react";

import type { ResponsiveMode } from "../layouts/types";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";

export type TurnDirection = "forward" | "backward";

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
  const [activeTurn, setActiveTurn] = useState<ActiveTurn | null>(null);
  const activeTurnId = useRef<number | null>(null);
  const nextTurnId = useRef(0);
  const transitionTimer = useRef<number | null>(null);
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
  }, []);

  const completeTurn = useCallback(() => {
    if (activeTurn !== null) {
      finishTurn(activeTurn.id);
    }
  }, [activeTurn, finishTurn]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
      }

      activeTurnId.current = null;
    };
  }, []);

  function navigateToPage(target: number, direction: TurnDirection) {
    const nextIndex = Math.max(0, Math.min(lastPageIndex, target));

    if (
      activeTurn !== null ||
      activeTurnId.current !== null ||
      nextIndex === activePageIndex
    ) {
      return;
    }

    const turnId = nextTurnId.current + 1;
    nextTurnId.current = turnId;
    activeTurnId.current = turnId;
    setActiveTurn({ id: turnId, direction });
    setActivePageIndex(nextIndex);
    transitionTimer.current = window.setTimeout(() => {
      finishTurn(turnId);
    }, turnFallbackDelay);
  }

  function next() {
    if (!coverOpen) {
      setCoverOpen(true);
      return;
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndex + 1, "forward");
      return;
    }

    const spread = desktopSpreadForPageIndex(activePageIndex);

    if (spread >= desktopSpreadCount - 1) {
      return;
    }

    navigateToPage(firstPageIndexForDesktopSpread(spread + 1), "forward");
  }

  function previous() {
    if (!coverOpen || activeTurn !== null || activeTurnId.current !== null) {
      return;
    }

    if (activePageIndex === 0) {
      setCoverOpen(false);
      return;
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndex - 1, "backward");
      return;
    }

    const spread = desktopSpreadForPageIndex(activePageIndex);
    navigateToPage(firstPageIndexForDesktopSpread(spread - 1), "backward");
  }

  function goToPage(pageIndex: number) {
    navigateToPage(
      pageIndex,
      pageIndex >= activePageIndex ? "forward" : "backward",
    );
  }

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
    openCover: () => setCoverOpen(true),
    activePageIndex,
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
  };
}

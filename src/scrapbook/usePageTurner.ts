import { useEffect, useRef, useState } from "react";

import type { ResponsiveMode } from "../layouts/types";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";

export type TurnDirection = "forward" | "backward";

type PageTurnerOptions = {
  pageCount: number;
  mode: ResponsiveMode;
};

export function usePageTurner({ pageCount, mode }: PageTurnerOptions) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState<TurnDirection | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const lastPageIndex = Math.max(0, pageCount - 1);
  const desktopSpreadCount = 1 + Math.ceil(Math.max(0, pageCount - 1) / 2);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function navigateToPage(target: number, direction: TurnDirection) {
    const nextIndex = Math.max(0, Math.min(lastPageIndex, target));

    if (transitionTimer.current !== null || nextIndex === activePageIndex) {
      return;
    }

    setTurnDirection(direction);
    setActivePageIndex(nextIndex);
    transitionTimer.current = window.setTimeout(() => {
      setTurnDirection(null);
      transitionTimer.current = null;
    }, 520);
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
    if (!coverOpen || turnDirection) {
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
    turnDirection,
    isTurning: turnDirection !== null,
    canPrevious: coverOpen,
    canNext,
    next,
    previous,
    goToPage,
  };
}

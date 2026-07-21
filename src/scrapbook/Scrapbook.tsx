import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { Cover } from "../components/Cover";
import type { CoverPhase } from "../components/Cover";
import { Decoration } from "../components/Decoration";
import { ScrapbookControls } from "../components/ScrapbookControls";
import type { ScrapbookContent } from "../content/types";
import { PageTurner } from "./PageTurner";
import { buildDesktopSpreads, buildPages } from "./pageModel";
import { SpreadRenderer } from "./SpreadRenderer";
import { useAdjacentImagePreload } from "./useAdjacentImagePreload";
import { usePageTurner } from "./usePageTurner";
import { useReducedMotion } from "./useReducedMotion";
import { useResponsiveMode } from "./useResponsiveMode";

type ScrapbookProps = {
  content: ScrapbookContent;
};

type KeyboardActions = {
  next: () => void;
  previous: () => void;
  first: () => void;
  last: () => void;
  contentOpen: boolean;
};

const interactiveKeyboardSelector =
  "button, a, input, textarea, select, dialog, [contenteditable='true']";

export function Scrapbook({ content }: ScrapbookProps) {
  const mode = useResponsiveMode();
  const pages = useMemo(() => buildPages(content), [content]);
  const desktopSpreads = useMemo(() => buildDesktopSpreads(pages), [pages]);
  const reducedMotion = useReducedMotion();
  const turner = usePageTurner({
    pageCount: pages.length,
    mode,
    reducedMotion,
  });
  const visualTurn =
    turner.turnState.phase === "idle" ? null : turner.turnState.turn;
  const [coverPhase, setCoverPhase] = useState<CoverPhase>("closed");
  const coverPhaseRef = useRef<CoverPhase>("closed");
  const experienceRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const coverButtonRef = useRef<HTMLButtonElement>(null);
  const focusContentAfterOpening = useRef(false);
  const focusCoverAfterClosing = useRef(false);
  const keyboardActions = useRef<KeyboardActions | null>(null);

  useAdjacentImagePreload(
    pages,
    turner.activePageIndex,
    mode === "desktop" ? 3 : 2,
    coverPhase === "opening" || coverPhase === "open",
  );

  const updateCoverPhase = useCallback((phase: CoverPhase) => {
    coverPhaseRef.current = phase;
    setCoverPhase(phase);
  }, []);

  const beginOpening = useCallback(() => {
    if (coverPhaseRef.current !== "closed") {
      return;
    }

    focusContentAfterOpening.current = true;
    updateCoverPhase("opening");
    turner.openCover();
  }, [turner.openCover, updateCoverPhase]);

  const requestNext = useCallback(() => {
    if (coverPhaseRef.current === "closed") {
      beginOpening();
      return;
    }

    if (coverPhaseRef.current !== "open") {
      return;
    }

    turner.next();
  }, [beginOpening, turner.next]);

  const requestPrevious = useCallback(() => {
    if (coverPhaseRef.current !== "open") {
      return;
    }

    const action = turner.previous();

    if (action === "cover-closed") {
      experienceRef.current?.focus({ preventScroll: true });
      focusCoverAfterClosing.current = true;
      updateCoverPhase("closing");
    }
  }, [turner.previous, updateCoverPhase]);

  const requestPage = useCallback(
    (pageIndex: number) => {
      if (coverPhaseRef.current === "open") {
        turner.goToPage(pageIndex);
      }
    },
    [turner.goToPage],
  );

  const settleCoverTransition = useCallback(
    (transition: "opening" | "closing") => {
      if (
        (transition === "opening" && coverPhaseRef.current !== "opening") ||
        (transition === "closing" && coverPhaseRef.current !== "closing")
      ) {
        return;
      }

      if (transition === "opening") {
        coverButtonRef.current?.blur();
        updateCoverPhase("open");
      } else {
        updateCoverPhase("closed");
      }
    },
    [updateCoverPhase],
  );

  const contentOpen = coverPhase === "open" && turner.coverOpen;
  const sourceContent = visualTurn ? (
    <SpreadRenderer
      activePageIndex={visualTurn.sourcePageIndex}
      decorationLabels={content.recipeDecorationLabels}
      desktopSpreads={desktopSpreads}
      engagementEnabled={false}
      mode={mode}
      onRememberPage={turner.rememberPage}
      pages={pages}
    />
  ) : null;
  const destinationContent = visualTurn ? (
    <SpreadRenderer
      activePageIndex={visualTurn.destinationPageIndex}
      decorationLabels={content.recipeDecorationLabels}
      desktopSpreads={desktopSpreads}
      engagementEnabled={false}
      mode={mode}
      onRememberPage={turner.rememberPage}
      pages={pages}
    />
  ) : null;
  const parkedPreviousContent =
    mode === "mobile" && turner.activePageIndex > 0 ? (
      <SpreadRenderer
        activePageIndex={turner.activePageIndex - 1}
        decorationLabels={content.recipeDecorationLabels}
        desktopSpreads={desktopSpreads}
        engagementEnabled={false}
        mode={mode}
        onRememberPage={turner.rememberPage}
        pages={pages}
      />
    ) : null;

  useLayoutEffect(() => {
    if (coverPhase === "open" && focusContentAfterOpening.current) {
      focusContentAfterOpening.current = false;
      contentRef.current?.focus({ preventScroll: true });
    } else if (coverPhase === "closed" && focusCoverAfterClosing.current) {
      focusCoverAfterClosing.current = false;
      coverButtonRef.current?.focus({ preventScroll: true });
    }
  }, [coverPhase]);

  useLayoutEffect(() => {
    keyboardActions.current = {
      next: requestNext,
      previous: requestPrevious,
      first: () => requestPage(0),
      last: () => requestPage(pages.length - 1),
      contentOpen,
    };
  }, [contentOpen, pages.length, requestNext, requestPage, requestPrevious]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest(interactiveKeyboardSelector) !== null))
      ) {
        return;
      }

      const actions = keyboardActions.current;

      if (!actions) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        actions.next();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        if (actions.contentOpen) {
          event.preventDefault();
          actions.previous();
        }
      } else if (event.key === "Home" && actions.contentOpen) {
        event.preventDefault();
        actions.first();
      } else if (event.key === "End" && actions.contentOpen) {
        event.preventDefault();
        actions.last();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const skipToContent = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (contentOpen) {
      contentRef.current?.focus({ preventScroll: true });
      return;
    }

    beginOpening();
  };

  const coverTransitioning =
    coverPhase === "opening" || coverPhase === "closing";

  return (
    <main
      className="scrapbook-experience table-surface"
      data-cover-phase={coverPhase}
      data-mode={mode}
      ref={experienceRef}
      tabIndex={-1}
    >
      <a
        className="skip-link"
        href="#scrapbook-content"
        onClick={skipToContent}
      >
        Skip to scrapbook content
      </a>

      <div className="table-scatter" aria-hidden="true">
        <span className="table-scatter__tram-ticket">
          {content.tableScatter.tramTicket}
        </span>
        <span className="table-scatter__coffee-ring" />
        <span className="table-scatter__pencil">
          {content.tableScatter.pencil}
        </span>
      </div>

      <div className="scrapbook-stage">
        <div
          aria-label={content.title}
          className="scrapbook-book"
          data-cover-phase={coverPhase}
          role="group"
        >
          <div
            aria-busy={turner.isBusy || undefined}
            aria-hidden={!contentOpen}
            aria-label="Scrapbook pages"
            className="scrapbook-page-region"
            id="scrapbook-content"
            inert={!contentOpen}
            ref={contentRef}
            role="region"
            tabIndex={-1}
          >
            <PageTurner
              canNext={turner.canNext}
              canPrevious={turner.canPrevious}
              destinationContent={destinationContent}
              enabled={contentOpen}
              isBusy={turner.isBusy}
              mode={mode}
              onDragCancel={turner.cancelDrag}
              onDragProgress={turner.updateDrag}
              onDragRelease={turner.releaseDrag}
              onDragStart={turner.beginDrag}
              onLayoutChange={turner.resolveForLayoutChange}
              onNext={requestNext}
              onPrevious={requestPrevious}
              onTurnComplete={turner.completeSettle}
              parkedPreviousContent={parkedPreviousContent}
              reducedMotion={reducedMotion}
              sourceContent={sourceContent}
              turnState={turner.turnState}
            >
              <SpreadRenderer
                activePageIndex={turner.activePageIndex}
                decorationLabels={content.recipeDecorationLabels}
                desktopSpreads={desktopSpreads}
                engagementEnabled={contentOpen && !turner.isBusy}
                mode={mode}
                onRememberPage={turner.rememberPage}
                pages={pages}
              />
            </PageTurner>
          </div>

          {coverTransitioning ? (
            <span className="scrapbook-cover-guard" aria-hidden="true" />
          ) : null}

          <Cover
            content={content.cover}
            onOpen={beginOpening}
            onTransitionSettled={settleCoverTransition}
            phase={coverPhase}
            ref={coverButtonRef}
            subtitle={content.subtitle}
            title={content.title}
          />
        </div>

        {contentOpen ? (
          <ScrapbookControls
            activeStep={turner.activeStep}
            canNext={turner.canNext}
            canPrevious={turner.canPrevious}
            interactionLocked={turner.isDragging}
            isBusy={turner.isBusy}
            onNext={requestNext}
            onPrevious={requestPrevious}
            totalSteps={turner.totalSteps}
          />
        ) : null}
      </div>

      <Decoration kind="flower" className="table-flower" />
    </main>
  );
}

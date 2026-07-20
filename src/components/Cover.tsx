import { forwardRef, useLayoutEffect, useRef } from "react";
import type { TransitionEventHandler } from "react";

import type { ScrapbookContent } from "../content/types";
import { Decoration } from "./Decoration";

export type CoverPhase = "closed" | "opening" | "open" | "closing";

type CoverProps = {
  title: string;
  subtitle: string;
  content: ScrapbookContent["cover"];
  phase: CoverPhase;
  onOpen: () => void;
  onTransitionSettled: (phase: "opening" | "closing") => void;
};

const coverTransitionFallback = 900;
const reducedMotionCoverTransitionFallback = 220;

export const Cover = forwardRef<HTMLButtonElement, CoverProps>(function Cover(
  { title, subtitle, content, phase, onOpen, onTransitionSettled },
  ref,
) {
  const settlingPhase = useRef<"opening" | "closing" | null>(null);

  useLayoutEffect(() => {
    if (phase !== "opening" && phase !== "closing") {
      settlingPhase.current = null;
      return;
    }

    settlingPhase.current = phase;
    const fallbackDelay = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? reducedMotionCoverTransitionFallback
      : coverTransitionFallback;
    const timer = window.setTimeout(() => {
      if (settlingPhase.current === phase) {
        settlingPhase.current = null;
        onTransitionSettled(phase);
      }
    }, fallbackDelay);

    return () => window.clearTimeout(timer);
  }, [onTransitionSettled, phase]);

  const finishTransition: TransitionEventHandler<HTMLElement> = (event) => {
    if (
      event.currentTarget !== event.target ||
      event.propertyName !== "transform" ||
      (phase !== "opening" && phase !== "closing") ||
      settlingPhase.current !== phase
    ) {
      return;
    }

    settlingPhase.current = null;
    onTransitionSettled(phase);
  };

  const unavailable = phase !== "closed";

  return (
    <section
      aria-hidden={phase === "open" || undefined}
      className="scrapbook-cover"
      data-phase={phase}
      onTransitionEnd={finishTransition}
    >
      <button
        aria-disabled={unavailable}
        aria-label={`Open ${title}`}
        className="scrapbook-cover__button scrapbook-cover__face scrapbook-cover__face--front"
        onClick={() => {
          if (!unavailable) {
            onOpen();
          }
        }}
        ref={ref}
        tabIndex={phase === "open" ? -1 : 0}
        type="button"
      >
        <span className="scrapbook-cover__stitched-border" aria-hidden="true" />
        <span className="scrapbook-cover__label">
          <span className="scrapbook-cover__eyebrow">{content.eyebrow}</span>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </span>
        <span className="scrapbook-cover__prompt">open the scrapbook ↗</span>
        <Decoration
          kind="stamp"
          label={content.stamp}
          className="scrapbook-cover__stamp"
        />
        <Decoration kind="heart" className="scrapbook-cover__heart" />
      </button>

      <div
        aria-hidden="true"
        className="scrapbook-cover__inside scrapbook-cover__face scrapbook-cover__face--back"
      >
        <span className="scrapbook-cover__inside-pocket">
          <i>{content.insideMaker}</i>
          <strong>{content.insideDedication}</strong>
          <small>{content.insideFooter}</small>
        </span>
        <span className="scrapbook-cover__inside-tape" />
        <span className="scrapbook-cover__inside-stitch" />
      </div>
    </section>
  );
});

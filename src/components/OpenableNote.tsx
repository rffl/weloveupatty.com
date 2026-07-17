import { useEffect, useRef, useState } from "react";

import { ReadingView } from "./ReadingView";

export type NoteVariant =
  | "letter"
  | "envelope"
  | "notebook"
  | "postcard"
  | "sticky"
  | "diary"
  | "receipt"
  | "ticket"
  | "love-letter";

type OpenableNoteProps = {
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly variant: NoteVariant;
  readonly className?: string;
};

const previewLimit = 170;

function getPreview(message: string) {
  if (message.length <= previewLimit) {
    return message;
  }

  return `${message.slice(0, previewLimit).trimEnd()}…`;
}

export function OpenableNote({
  title,
  message,
  detail,
  variant,
  className = "",
}: OpenableNoteProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (open || !shouldRestoreFocusRef.current) {
      return;
    }

    shouldRestoreFocusRef.current = false;

    if (typeof window === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const openNote = () => {
    shouldRestoreFocusRef.current = false;
    setOpen(true);
  };

  const closeNote = () => {
    if (!open) {
      return;
    }

    shouldRestoreFocusRef.current = true;
    setOpen(false);
  };

  return (
    <>
      <button
        aria-label={`Open ${title}'s full message`}
        className={`openable-note openable-note--${variant} ${className}`.trim()}
        onClick={openNote}
        ref={triggerRef}
        type="button"
      >
        <span className="openable-note__eyebrow">A note from</span>
        <strong className="openable-note__name">{title}</strong>
        <span className="openable-note__preview">{getPreview(message)}</span>
        <span aria-hidden="true" className="openable-note__hint">
          tap to open ↗
        </span>
      </button>

      <ReadingView
        detail={detail}
        message={message}
        onRequestClose={closeNote}
        open={open}
        title={title}
      />
    </>
  );
}

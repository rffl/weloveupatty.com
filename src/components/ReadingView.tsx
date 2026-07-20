import { useEffect, useId, useRef } from "react";

type ReadingViewProps = {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly onRequestClose: () => void;
};

export function ReadingView({
  open,
  title,
  message,
  detail,
  onRequestClose,
}: ReadingViewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        closeButtonRef.current?.focus();
      }

      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby={titleId}
      className="reading-view"
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onRequestClose();
        }
      }}
      onClose={() => {
        if (open) {
          onRequestClose();
        }
      }}
      ref={dialogRef}
    >
      <article
        className="reading-view__paper paper-surface paper-surface--light"
      >
        <button
          aria-label="Close enlarged message"
          className="reading-view__close"
          onClick={onRequestClose}
          ref={closeButtonRef}
          type="button"
        >
          Close ×
        </button>

        <div
          aria-label={`Full message from ${title}`}
          className="reading-view__content"
          role="region"
          tabIndex={0}
        >
          {detail ? <p className="reading-view__detail">{detail}</p> : null}
          <h2 id={titleId}>{title}</h2>
          <p className="reading-view__message">{message}</p>
        </div>
      </article>
    </dialog>
  );
}

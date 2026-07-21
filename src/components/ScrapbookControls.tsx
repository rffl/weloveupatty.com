type ScrapbookControlsProps = {
  activeStep: number;
  totalSteps: number;
  canPrevious: boolean;
  canNext: boolean;
  isBusy: boolean;
  interactionLocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function ScrapbookControls({
  activeStep,
  totalSteps,
  canPrevious,
  canNext,
  isBusy,
  interactionLocked,
  onPrevious,
  onNext,
}: ScrapbookControlsProps) {
  const previousUnavailable = !canPrevious || interactionLocked;
  const nextUnavailable = !canNext || interactionLocked;
  const canBuffer = isBusy && !interactionLocked;

  return (
    <nav
      aria-busy={isBusy || undefined}
      aria-label="Scrapbook pages"
      className="scrapbook-controls"
      data-turning={isBusy || undefined}
    >
      <button
        aria-disabled={previousUnavailable}
        className="scrapbook-control scrapbook-control--previous"
        data-boundary={!canPrevious || undefined}
        data-buffering={canBuffer || undefined}
        data-turning={isBusy || undefined}
        onClick={() => {
          if (!previousUnavailable) {
            onPrevious();
          }
        }}
        type="button"
      >
        <span aria-hidden="true">←</span> Back
      </button>
      <p className="scrapbook-progress" aria-live="polite">
        <span>memory</span>
        <strong>
          {activeStep + 1} / {totalSteps}
        </strong>
      </p>
      <button
        aria-disabled={nextUnavailable}
        className="scrapbook-control scrapbook-control--next"
        data-boundary={!canNext || undefined}
        data-buffering={canBuffer || undefined}
        data-turning={isBusy || undefined}
        onClick={() => {
          if (!nextUnavailable) {
            onNext();
          }
        }}
        type="button"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

type ScrapbookControlsProps = {
  activeStep: number;
  totalSteps: number;
  canPrevious: boolean;
  canNext: boolean;
  isTurning: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function ScrapbookControls({
  activeStep,
  totalSteps,
  canPrevious,
  canNext,
  isTurning,
  onPrevious,
  onNext,
}: ScrapbookControlsProps) {
  const previousUnavailable = !canPrevious || isTurning;
  const nextUnavailable = !canNext || isTurning;

  return (
    <nav
      aria-busy={isTurning || undefined}
      aria-label="Scrapbook pages"
      className="scrapbook-controls"
      data-turning={isTurning || undefined}
    >
      <button
        aria-disabled={previousUnavailable}
        className="scrapbook-control scrapbook-control--previous"
        data-boundary={!canPrevious || undefined}
        data-turning={isTurning || undefined}
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
        data-turning={isTurning || undefined}
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

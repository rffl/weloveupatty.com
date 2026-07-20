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
        type="button"
        className="scrapbook-control scrapbook-control--previous"
        aria-disabled={previousUnavailable}
        disabled={!canPrevious}
        onClick={() => {
          if (!previousUnavailable) {
            onPrevious();
          }
        }}
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
        type="button"
        className="scrapbook-control scrapbook-control--next"
        aria-disabled={nextUnavailable}
        disabled={!canNext}
        onClick={() => {
          if (!nextUnavailable) {
            onNext();
          }
        }}
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

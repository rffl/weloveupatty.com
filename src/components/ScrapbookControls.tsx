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
  return (
    <nav className="scrapbook-controls" aria-label="Scrapbook pages">
      <button
        type="button"
        className="scrapbook-control scrapbook-control--previous"
        onClick={onPrevious}
        disabled={!canPrevious || isTurning}
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
        onClick={onNext}
        disabled={!canNext || isTurning}
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

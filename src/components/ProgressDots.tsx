const STEP_LABELS = [
  "Verify",
  "Quiz",
  "Reveal",
  "Preview",
  "Unlock",
  "Profile",
  "Upload",
  "Analyze",
  "Dashboard",
];

export function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-6 pt-6" aria-label={`Step ${currentStep} of ${STEP_LABELS.length}`}>
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              isDone || isCurrent ? "bg-text-accent" : "bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}

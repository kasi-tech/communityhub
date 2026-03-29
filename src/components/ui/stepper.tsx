interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  className = "",
}: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPending = !isCompleted && !isCurrent;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.label}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-indigo-500 text-white"
                      : isCurrent
                        ? "border-2 border-indigo-500 bg-white text-indigo-500"
                        : "border-2 border-gray-300 bg-white text-gray-400"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isPending ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

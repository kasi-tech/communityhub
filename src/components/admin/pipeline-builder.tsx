"use client";

import type { OnboardingStep } from "@/types";

interface PipelineBuilderProps {
  steps: OnboardingStep[];
  onChange: (steps: OnboardingStep[]) => void;
  autoApproveThreshold: number;
  onThresholdChange: (value: number) => void;
}

const ALWAYS_ON_STEPS = new Set(["personal-info", "contact-details", "membership-tier"]);

export function PipelineBuilder({
  steps,
  onChange,
  autoApproveThreshold,
  onThresholdChange,
}: PipelineBuilderProps) {
  const handleToggle = (id: string) => {
    if (ALWAYS_ON_STEPS.has(id)) return;
    const updated = steps.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...steps];
    const temp = updated[index - 1]!;
    updated[index - 1] = { ...updated[index]!, order: temp.order };
    updated[index] = { ...temp, order: updated[index]!.order };
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index + 1]!;
    updated[index + 1] = { ...updated[index]!, order: temp.order };
    updated[index] = { ...temp, order: updated[index]!.order };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {steps
          .sort((a, b) => a.order - b.order)
          .map((step, index) => {
            const alwaysOn = ALWAYS_ON_STEPS.has(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  step.enabled
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Drag handle / reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    aria-label={`Move ${step.name} up`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === steps.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    aria-label={`Move ${step.name} down`}
                  >
                    ▼
                  </button>
                </div>

                <span className="text-lg" aria-hidden="true">
                  ≡
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  <p className="text-xs text-gray-500">
                    {step.required ? "Required" : "Optional"}
                    {alwaysOn ? " — Always enabled" : ""}
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={step.enabled}
                  aria-label={`Toggle ${step.name}`}
                  disabled={alwaysOn}
                  onClick={() => handleToggle(step.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    step.enabled ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                      step.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
      </div>

      {/* Auto-approve threshold slider */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label htmlFor="auto-approve-threshold" className="block text-sm font-medium text-gray-700">
          Auto-approve fraud score threshold
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Applications with a fraud score below this threshold will be auto-approved.
          Current: <span className="font-semibold text-indigo-600">{autoApproveThreshold}</span>
        </p>
        <input
          id="auto-approve-threshold"
          type="range"
          min={0}
          max={100}
          value={autoApproveThreshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-500"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>0 (strict)</span>
          <span>100 (lenient)</span>
        </div>
      </div>
    </div>
  );
}

"use client";

interface FraudScoreBarProps {
  score: number;
}

export function FraudScoreBar({ score }: FraudScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  let colorClass: string;
  let bgClass: string;
  let label: string;

  if (clampedScore < 30) {
    colorClass = "bg-green-500";
    bgClass = "bg-green-100";
    label = "Low risk";
  } else if (clampedScore < 70) {
    colorClass = "bg-yellow-500";
    bgClass = "bg-yellow-100";
    label = "Medium risk";
  } else {
    colorClass = "bg-red-500";
    bgClass = "bg-red-100";
    label = "High risk";
  }

  return (
    <div className="flex items-center gap-2" aria-label={`Fraud score: ${clampedScore} — ${label}`}>
      <div className={`h-2 w-20 overflow-hidden rounded-full ${bgClass}`}>
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold ${
          clampedScore < 30
            ? "text-green-700"
            : clampedScore < 70
              ? "text-yellow-700"
              : "text-red-700"
        }`}
      >
        {clampedScore}
      </span>
    </div>
  );
}

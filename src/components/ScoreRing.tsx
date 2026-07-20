"use client";

interface ScoreRingProps {
  score?: number; // 0-100, omit or pass locked=true before analysis exists
  locked?: boolean;
  size?: number;
}

export function ScoreRing({ score = 0, locked = false, size = 176 }: ScoreRingProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = locked ? circumference : circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0a93b" />
            <stop offset="100%" stopColor="#33d6a6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {!locked && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#score-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {locked ? (
          <>
            <span className="font-display text-4xl font-semibold text-text-muted">?</span>
            <span className="mt-1 text-[11px] text-text-muted">Locked</span>
          </>
        ) : (
          <>
            <span className="font-mono-figures text-4xl font-semibold text-text-primary">
              {score}
            </span>
            <span className="mt-1 text-[11px] text-text-secondary">Arth Score</span>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useLocale } from "@/context/LocaleProvider";

interface HistoryPoint {
  arthScore: number;
  createdAt: string | null;
}

export function ScoreHistoryChart({ points }: { points: HistoryPoint[] }) {
  const { t } = useLocale();
  if (points.length < 2) return null; // nothing to trend with a single point

  const width = 280;
  const height = 72;
  const padX = 4;
  const padY = 10;

  const scores = points.map((p) => p.arthScore);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;
  const stepX = (width - padX * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((p.arthScore - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1][0]},${height} L${coords[0][0]},${height} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.arthScore - first.arthScore;

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="history-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a93b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f0a93b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#history-fill)" />
        <path d={linePath} fill="none" stroke="#f0a93b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 3.5 : 2} fill="#f0a93b" />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span className="text-text-muted">{t("dashboard.analysesCount", { count: points.length })}</span>
        <span className={delta >= 0 ? "text-text-success" : "text-text-warning"}>
          {delta >= 0 ? "+" : ""}
          {delta} {t("dashboard.sinceFirst")}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useLocale } from "@/context/LocaleProvider";

interface BudgetBarProps {
  emis: number;
  livingExpenses: number;
  savings: number;
}

const SEGMENTS: { key: keyof BudgetBarProps; labelKey: string; colorVar: string }[] = [
  { key: "emis", labelKey: "dashboard.emisLabel", colorVar: "--text-warning" },
  { key: "livingExpenses", labelKey: "dashboard.livingExpensesLabel", colorVar: "--text-accent" },
  { key: "savings", labelKey: "dashboard.savingsLabel", colorVar: "--text-success" },
];

export function BudgetBar({ emis, livingExpenses, savings }: BudgetBarProps) {
  const { t } = useLocale();
  const total = emis + livingExpenses + savings || 1;
  const values = { emis, livingExpenses, savings };

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            style={{
              width: `${(values[seg.key] / total) * 100}%`,
              backgroundColor: `var(${seg.colorVar})`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(${seg.colorVar})` }}
              />
              {t(seg.labelKey)}
            </span>
            <span className="font-mono-figures text-text-primary">
              ₹{values[seg.key].toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

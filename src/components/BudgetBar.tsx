interface BudgetBarProps {
  emis: number;
  livingExpenses: number;
  savings: number;
}

const SEGMENTS: { key: keyof Omit<BudgetBarProps, never>; label: string; colorVar: string }[] = [
  { key: "emis", label: "EMIs", colorVar: "--text-warning" },
  { key: "livingExpenses", label: "Living expenses", colorVar: "--text-accent" },
  { key: "savings", label: "Savings", colorVar: "--text-success" },
];

export function BudgetBar({ emis, livingExpenses, savings }: BudgetBarProps) {
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
              {seg.label}
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

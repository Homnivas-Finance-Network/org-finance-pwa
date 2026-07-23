"use client";

import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import { Card } from "@/components/Card";
import { BudgetBar } from "@/components/BudgetBar";
import { ScoreHistoryChart } from "@/components/ScoreHistoryChart";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { api } from "@/lib/api";

interface HistoryPoint {
  arthScore: number;
  createdAt: string | null;
}

export default function DashboardPage() {
  const { analysis } = useJourney();
  const { t } = useLocale();
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    api
      .getHistory()
      .then((data) => setHistory(data.history ?? []))
      .catch(() => setHistory([])); // history is a nice-to-have, never block the dashboard on it
  }, []);

  if (!analysis) return null; // layout guard handles the redirect

  return (
    <main className="flex flex-1 flex-col gap-5 px-6 py-8 pb-4">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t("dashboard.subtitle")}</p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <ScoreRing score={analysis.arthScore} />
        <div className="flex w-full justify-around border-t border-border pt-4 text-center">
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              {analysis.actualCibil}
            </p>
            <p className="text-[11px] text-text-muted">{t("dashboard.cibilLabel")}</p>
          </div>
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              ₹{analysis.totalCurrentEmi.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-text-muted">{t("dashboard.emiLabel")}</p>
          </div>
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              ₹{analysis.monthlySalary.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-text-muted">{t("dashboard.incomeLabel")}</p>
          </div>
        </div>
      </Card>

      {history.length >= 2 && (
        <Card>
          <h2 className="font-display text-[15px] font-semibold text-text-primary">
            {t("dashboard.scoreHistoryTitle")}
          </h2>
          <div className="mt-3">
            <ScoreHistoryChart points={history} />
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-[15px] font-semibold text-text-primary">
          {t("dashboard.debtAvalancheTitle")}
        </h2>
        <p className="mt-1 text-[12px] text-text-muted">{t("dashboard.debtAvalancheSubtitle")}</p>
        <ol className="mt-4 flex flex-col gap-3">
          {analysis.debtReductionRoadmap.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-accent font-mono-figures text-[12px] font-semibold text-text-accent">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed text-text-secondary">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold text-text-primary">
          {t("dashboard.monthlyBudgetTitle")}
        </h2>
        <div className="mt-4">
          <BudgetBar
            emis={analysis.chartData.emis}
            livingExpenses={analysis.chartData.livingExpenses}
            savings={analysis.chartData.savings}
          />
        </div>
      </Card>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/ScoreRing";
import { Card } from "@/components/Card";
import { BudgetBar } from "@/components/BudgetBar";
import { AskArth } from "@/components/AskArth";
import { OneEmiOffer, LoanAgainstFdOffer } from "@/components/OfferCards";
import { useJourney } from "@/context/JourneyProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { analysis } = useJourney();

  useEffect(() => {
    if (!analysis) router.replace("/upload");
  }, [analysis, router]);

  if (!analysis) return null;

  return (
    <main className="flex flex-1 flex-col gap-5 px-6 py-8">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          Your financial home
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Built from your actual documents.</p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <ScoreRing score={analysis.arthScore} />
        <div className="flex w-full justify-around border-t border-border pt-4 text-center">
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              {analysis.actualCibil}
            </p>
            <p className="text-[11px] text-text-muted">CIBIL</p>
          </div>
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              ₹{analysis.totalCurrentEmi.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-text-muted">Monthly EMI</p>
          </div>
          <div>
            <p className="font-mono-figures text-lg font-semibold text-text-primary">
              ₹{analysis.monthlySalary.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-text-muted">Income</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold text-text-primary">
          Debt Avalanche plan
        </h2>
        <p className="mt-1 text-[12px] text-text-muted">Pay these off in this order</p>
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
          Monthly budget
        </h2>
        <div className="mt-4">
          <BudgetBar
            emis={analysis.chartData.emis}
            livingExpenses={analysis.chartData.livingExpenses}
            savings={analysis.chartData.savings}
          />
        </div>
      </Card>

      <AskArth />

      {analysis.ELIGIBLE_FOR_1_EMI && <OneEmiOffer />}
      <LoanAgainstFdOffer analysis={analysis} />
    </main>
  );
}

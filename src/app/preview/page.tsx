"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/ScoreRing";
import { Card } from "@/components/Card";
import { LockOverlay } from "@/components/LockOverlay";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { useLocale } from "@/context/LocaleProvider";

export default function PreviewPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [rate, setRate] = useState(11.5);

  const monthlyRate = rate / 12 / 100;
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return (
    <>
      <ProgressDots currentStep={4} />
      <main className="flex flex-1 flex-col gap-5 px-6 py-8">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-text-primary">
            {t("preview.title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t("preview.subtitle")}</p>
        </div>

        <Card className="flex flex-col items-center gap-3 py-8">
          <ScoreRing locked />
          <p className="text-center text-sm text-text-secondary">
            {t("preview.lockedScoreCaption")}
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-[15px] font-semibold text-text-primary">
            {t("preview.emiCalculator")}
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">{t("preview.freeToUse")}</p>

          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex justify-between text-[13px] text-text-secondary">
                <span>{t("preview.loanAmount")}</span>
                <span className="font-mono-figures text-text-primary">
                  ₹{loanAmount.toLocaleString("en-IN")}
                </span>
              </span>
              <input
                type="range"
                min={50000}
                max={5000000}
                step={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="accent-[#f0a93b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex justify-between text-[13px] text-text-secondary">
                <span>{t("preview.tenure")}</span>
                <span className="font-mono-figures text-text-primary">
                  {tenureMonths} {t("preview.months")}
                </span>
              </span>
              <input
                type="range"
                min={6}
                max={84}
                step={6}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="accent-[#f0a93b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex justify-between text-[13px] text-text-secondary">
                <span>{t("preview.interestRate")}</span>
                <span className="font-mono-figures text-text-primary">{rate}%</span>
              </span>
              <input
                type="range"
                min={8}
                max={24}
                step={0.5}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="accent-[#f0a93b]"
              />
            </label>
          </div>

          <div className="mt-5 rounded-card border border-border-accent bg-bg-accent px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-text-accent">
              {t("preview.monthlyEmi")}
            </p>
            <p className="mt-1 font-mono-figures text-2xl font-semibold text-text-primary">
              ₹{Math.round(emi).toLocaleString("en-IN")}
            </p>
          </div>
        </Card>

        <LockOverlay label={t("preview.budgetLocked")}>
          <Card>
            <h2 className="font-display text-[15px] font-semibold">{t("preview.monthlyBudgetTitle")}</h2>
            <div className="mt-3 h-24 rounded bg-surface-2" />
          </Card>
        </LockOverlay>

        <LockOverlay label={t("preview.aiAdvisorLocked")}>
          <Card>
            <h2 className="font-display text-[15px] font-semibold">{t("preview.askArthAnything")}</h2>
            <div className="mt-3 h-16 rounded bg-surface-2" />
          </Card>
        </LockOverlay>

        <LockOverlay label={t("preview.oneEmiLocked")}>
          <Card>
            <h2 className="font-display text-[15px] font-semibold">
              {t("preview.applyOneEmi")}
            </h2>
            <p className="mt-2 text-[13px] text-text-secondary">
              {t("preview.oneEmiLockedDesc")}
            </p>
          </Card>
        </LockOverlay>

        <Button onClick={() => router.push("/checkout")}>{t("preview.unlockPro")}</Button>
      </main>
    </>
  );
}

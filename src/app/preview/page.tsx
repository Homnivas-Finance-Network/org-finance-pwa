"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/ScoreRing";
import { Card } from "@/components/Card";
import { LockOverlay } from "@/components/LockOverlay";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";

export default function PreviewPage() {
  const router = useRouter();
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
            Your financial home
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Some of this is free to use right now. The rest unlocks with Homnivas Pro.
          </p>
        </div>

        <Card className="flex flex-col items-center gap-3 py-8">
          <ScoreRing locked />
          <p className="text-center text-sm text-text-secondary">
            Your real Arth Score comes from your actual CIBIL report and bank statement —
            not a guess.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-[15px] font-semibold text-text-primary">
            EMI calculator
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">Free to use — try any numbers</p>

          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex justify-between text-[13px] text-text-secondary">
                <span>Loan amount</span>
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
                <span>Tenure</span>
                <span className="font-mono-figures text-text-primary">{tenureMonths} months</span>
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
                <span>Interest rate</span>
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
            <p className="text-[11px] uppercase tracking-wider text-text-accent">Monthly EMI</p>
            <p className="mt-1 font-mono-figures text-2xl font-semibold text-text-primary">
              ₹{Math.round(emi).toLocaleString("en-IN")}
            </p>
          </div>
        </Card>

        <LockOverlay label="Budget breakdown — unlock with Pro">
          <Card>
            <h2 className="font-display text-[15px] font-semibold">Monthly budget</h2>
            <div className="mt-3 h-24 rounded bg-surface-2" />
          </Card>
        </LockOverlay>

        <LockOverlay label="AI advisor & Debt Avalanche plan — unlock with Pro">
          <Card>
            <h2 className="font-display text-[15px] font-semibold">Ask Arth anything</h2>
            <div className="mt-3 h-16 rounded bg-surface-2" />
          </Card>
        </LockOverlay>

        <Button onClick={() => router.push("/checkout")}>Unlock Homnivas Pro — ₹345</Button>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function ConfirmPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { analysis, setAnalysis } = useJourney();
  const [salary, setSalary] = useState(analysis?.monthlySalary?.toString() ?? "");
  const [emi, setEmi] = useState(analysis?.totalCurrentEmi?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!analysis) return null;

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      const updated = await api.confirmNumbers(analysis!.analysisId, Number(salary), Number(emi));
      setAnalysis(updated);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("confirm.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <h1 className="font-display text-[22px] font-semibold text-text-primary">{t("confirm.title")}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t("confirm.subtitle")}</p>

      <Card className="mt-6">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-text-warning" />
          <p className="text-[13px] leading-relaxed text-text-secondary">{t("confirm.emiWarning")}</p>
        </div>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-text-secondary">{t("confirm.emiLabel")}</span>
          <div className="flex items-center gap-2 rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 focus-within:border-text-accent">
            <span className="text-[15px] text-text-secondary">₹</span>
            <input type="number" inputMode="numeric" value={emi} onChange={(e) => setEmi(e.target.value)} className="w-full bg-transparent font-mono-figures text-[15px] text-text-primary outline-none" />
          </div>
        </label>
      </Card>

      <Card className="mt-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-text-warning" />
          <p className="text-[13px] leading-relaxed text-text-secondary">{t("confirm.incomeWarning")}</p>
        </div>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-text-secondary">{t("confirm.incomeLabel")}</span>
          <div className="flex items-center gap-2 rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 focus-within:border-text-accent">
            <span className="text-[15px] text-text-secondary">₹</span>
            <input type="number" inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full bg-transparent font-mono-figures text-[15px] text-text-primary outline-none" />
          </div>
        </label>
      </Card>

      {error && <p className="mt-3 text-[13px] text-text-warning">{error}</p>}

      <div className="mt-auto pt-8">
        <Button onClick={handleConfirm} loading={loading}>{t("confirm.continueButton")}</Button>
      </div>
    </main>
  );
}

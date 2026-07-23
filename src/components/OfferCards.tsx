"use client";

import { useState } from "react";
import { TrendingDown, ShieldCheck } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { api, ApiError } from "@/lib/api";
import { useLocale } from "@/context/LocaleProvider";
import type { AnalysisResult } from "@/lib/types";

function OfferSubmitted() {
  const { t } = useLocale();
  return (
    <p className="mt-3 rounded-card border border-border-success bg-bg-success px-4 py-3 text-[13px] text-text-success">
      {t("offers.sentToPartner")}
    </p>
  );
}

export function OneEmiOffer() {
  const { t } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      await api.submitLead("ONE_EMI");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("offers.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border-rev">
      <div className="flex items-center gap-2.5">
        <TrendingDown size={18} className="text-text-rev" />
        <h2 className="font-display text-[15px] font-semibold text-text-primary">
          {t("offers.oneEmiTitle")}
        </h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{t("offers.oneEmiDesc")}</p>
      {submitted ? (
        <OfferSubmitted />
      ) : (
        <div className="mt-3">
          {error && <p className="mb-2 text-[13px] text-text-warning">{error}</p>}
          <Button variant="secondary" onClick={handleApply} loading={loading}>
            {t("offers.checkConsolidation")}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function LoanAgainstFdOffer({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useLocale();
  const [showDeclare] = useState(!analysis.fdSignalDetected);
  const [declaredAmount, setDeclaredAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeclareAndApply() {
    setLoading(true);
    setError(null);
    try {
      const amount = Number(declaredAmount);
      if (showDeclare && amount > 0) {
        await api.declareFD(amount);
      }
      await api.submitLead("LOAN_AGAINST_FD", showDeclare ? amount : undefined);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("offers.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  const headline = analysis.ELIGIBLE_FOR_1_EMI
    ? t("offers.fdHeadlineEligible")
    : t("offers.fdHeadlineNotEligible");

  return (
    <Card className="border-border-rev">
      <div className="flex items-center gap-2.5">
        <ShieldCheck size={18} className="text-text-rev" />
        <h2 className="font-display text-[15px] font-semibold text-text-primary">{headline}</h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{t("offers.fdDesc")}</p>

      {submitted ? (
        <OfferSubmitted />
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {showDeclare && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-text-secondary">{t("offers.fdAmountLabel")}</span>
              <input
                type="number"
                inputMode="numeric"
                value={declaredAmount}
                onChange={(e) => setDeclaredAmount(e.target.value)}
                placeholder={t("offers.fdAmountPlaceholder")}
                className="rounded-card border border-border-strong bg-surface-1 px-4 py-3 font-mono-figures text-[14px] text-text-primary outline-none focus:border-text-accent placeholder:font-body placeholder:text-text-muted"
              />
            </label>
          )}
          {error && <p className="text-[13px] text-text-warning">{error}</p>}
          <Button variant="secondary" onClick={handleDeclareAndApply} loading={loading}>
            {t("offers.checkFdOffer")}
          </Button>
        </div>
      )}
    </Card>
  );
}

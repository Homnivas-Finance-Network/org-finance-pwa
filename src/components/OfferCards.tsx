"use client";

import { useState } from "react";
import { TrendingDown, ShieldCheck } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { api, ApiError } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";

function OfferSubmitted() {
  return (
    <p className="mt-3 rounded-card border border-border-success bg-bg-success px-4 py-3 text-[13px] text-text-success">
      Sent to our lending partner. They&apos;ll reach out on your registered number.
    </p>
  );
}

export function OneEmiOffer() {
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
      setError(err instanceof ApiError ? err.message : "Couldn't submit that. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border-rev">
      <div className="flex items-center gap-2.5">
        <TrendingDown size={18} className="text-text-rev" />
        <h2 className="font-display text-[15px] font-semibold text-text-primary">
          1-EMI consolidation
        </h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
        Your scattered loans can be consolidated into one lower-EMI plan. One click packages your
        verified documents and sends them to our lending partner.
      </p>
      {submitted ? (
        <OfferSubmitted />
      ) : (
        <div className="mt-3">
          {error && <p className="mb-2 text-[13px] text-text-warning">{error}</p>}
          <Button variant="secondary" onClick={handleApply} loading={loading}>
            Check my consolidation offer
          </Button>
        </div>
      )}
    </Card>
  );
}

export function LoanAgainstFdOffer({ analysis }: { analysis: AnalysisResult }) {
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
      setError(err instanceof ApiError ? err.message : "Couldn't submit that. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const headline = analysis.ELIGIBLE_FOR_1_EMI
    ? "Have an FD? Get an even lower rate"
    : "Borrow against your FD — no credit score needed";

  return (
    <Card className="border-border-rev">
      <div className="flex items-center gap-2.5">
        <ShieldCheck size={18} className="text-text-rev" />
        <h2 className="font-display text-[15px] font-semibold text-text-primary">{headline}</h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
        A loan against your Fixed Deposit is secured, so approval doesn&apos;t depend on your
        CIBIL score — usually a lower rate than an unsecured loan too.
      </p>

      {submitted ? (
        <OfferSubmitted />
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {showDeclare && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-text-secondary">Approximate FD amount</span>
              <input
                type="number"
                inputMode="numeric"
                value={declaredAmount}
                onChange={(e) => setDeclaredAmount(e.target.value)}
                placeholder="₹1,00,000"
                className="rounded-card border border-border-strong bg-surface-1 px-4 py-3 font-mono-figures text-[14px] text-text-primary outline-none focus:border-text-accent placeholder:font-body placeholder:text-text-muted"
              />
            </label>
          )}
          {error && <p className="text-[13px] text-text-warning">{error}</p>}
          <Button variant="secondary" onClick={handleDeclareAndApply} loading={loading}>
            Check my FD loan offer
          </Button>
        </div>
      )}
    </Card>
  );
}

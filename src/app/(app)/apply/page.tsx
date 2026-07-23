"use client";

import { OneEmiOffer, LoanAgainstFdOffer } from "@/components/OfferCards";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";

export default function ApplyPage() {
  const { analysis } = useJourney();
  const { t } = useLocale();
  if (!analysis) return null; // layout guard handles the redirect

  return (
    <main className="flex flex-1 flex-col gap-5 px-6 py-8 pb-4">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">{t("apply.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("apply.subtitle")}</p>
      </div>

      {analysis.ELIGIBLE_FOR_1_EMI && <OneEmiOffer />}
      <LoanAgainstFdOffer analysis={analysis} />

      {!analysis.ELIGIBLE_FOR_1_EMI && !analysis.fdSignalDetected && (
        <p className="text-center text-[13px] text-text-muted">{t("apply.noOffersYet")}</p>
      )}
    </main>
  );
}

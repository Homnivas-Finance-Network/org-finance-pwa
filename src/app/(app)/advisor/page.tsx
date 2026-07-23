"use client";

import { AskArth } from "@/components/AskArth";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";

export default function AdvisorPage() {
  const { analysis } = useJourney();
  const { t } = useLocale();
  if (!analysis) return null; // layout guard handles the redirect

  return (
    <main className="flex flex-1 flex-col gap-5 px-6 py-8 pb-4">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">{t("advisor.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("advisor.subtitle")}</p>
      </div>

      <AskArth />
    </main>
  );
}

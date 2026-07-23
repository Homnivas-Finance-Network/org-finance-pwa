"use client";

import { useRouter } from "next/navigation";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { useEffect } from "react";

export default function RevealPage() {
  const router = useRouter();
  const { archetype } = useJourney();
  const { t } = useLocale();

  useEffect(() => {
    // Guard against landing here directly without having taken the quiz
    if (!archetype) router.replace("/quiz");
  }, [archetype, router]);

  if (!archetype) return null;

  function handleShare() {
    const text = t("reveal.shareText", { archetype: archetype ?? "" });
    if (navigator.share) {
      navigator.share({ text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <>
      <ProgressDots currentStep={3} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <p className="text-center text-[13px] font-medium uppercase tracking-wider text-text-muted">
          {t("reveal.quizComplete")}
        </p>

        <div className="mt-6">
          <ArchetypeCard archetype={archetype} />
        </div>

        <button
          onClick={handleShare}
          className="mt-4 self-center text-[13px] font-medium text-text-accent underline underline-offset-2"
        >
          {t("reveal.shareResult")}
        </button>

        <div className="mt-8 flex-1">
          <p className="text-[13px] font-medium text-text-secondary">
            {t("reveal.whatArchetypesDontKnow", { archetype })}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {t("reveal.arthScoreTeaser")}
          </p>
        </div>

        <Button onClick={() => router.push("/preview")}>{t("reveal.seeFinancialHome")}</Button>
      </main>
    </>
  );
}

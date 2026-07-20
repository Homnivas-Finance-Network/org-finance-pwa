"use client";

import { useRouter } from "next/navigation";
import { useJourney } from "@/context/JourneyProvider";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { useEffect } from "react";

export default function RevealPage() {
  const router = useRouter();
  const { archetype } = useJourney();

  useEffect(() => {
    // Guard against landing here directly without having taken the quiz
    if (!archetype) router.replace("/quiz");
  }, [archetype, router]);

  if (!archetype) return null;

  function handleShare() {
    const text = `I'm a ${archetype} — just found out my financial personality on Homnivas Finance Network.`;
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
          Quiz complete
        </p>

        <div className="mt-6">
          <ArchetypeCard archetype={archetype} />
        </div>

        <button
          onClick={handleShare}
          className="mt-4 self-center text-[13px] font-medium text-text-accent underline underline-offset-2"
        >
          Share your result
        </button>

        <div className="mt-8 flex-1">
          <p className="text-[13px] font-medium text-text-secondary">
            Here&apos;s what {archetype}s usually don&apos;t know about themselves:
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Your Arth Score — a real read on your CIBIL, EMIs, and spending, not a guess — is
            waiting on the next screen. Most people who take this quiz have no idea what their
            actual number is.
          </p>
        </div>

        <Button onClick={() => router.push("/preview")}>See my financial home</Button>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useJourney } from "@/context/JourneyProvider";
import { takePendingUpload } from "@/lib/uploadHolder";
import { Button } from "@/components/Button";

const MESSAGES = [
  "Scanning your CIBIL report…",
  "Extracting loan and EMI details…",
  "Analysing 6 months of spending…",
  "Checking for FD interest signals…",
  "Building your Debt Avalanche order…",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { setAnalysis } = useJourney();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pending = takePendingUpload();
    if (!pending) {
      // Direct navigation here without going through /upload first — nothing to analyze
      router.replace("/upload");
      return;
    }

    let cancelled = false;
    api
      .analyze(pending.cibilPdf, pending.bankStatementPdf, pending.password || undefined)
      .then((result) => {
        if (cancelled) return;
        setAnalysis(result);
        router.push("/dashboard");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong reading your documents. Try again."
        );
      });

    return () => {
      cancelled = true;
    };
    // Intentionally runs once on mount — re-running on every render would
    // re-submit the same files.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-[15px] text-text-warning">{error}</p>
        <div className="mt-6 w-full">
          <Button onClick={() => router.push("/upload")}>Try again</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-border-strong border-t-text-accent" />
      <p className="mt-8 font-display text-[17px] font-medium text-text-primary">
        {MESSAGES[messageIndex]}
      </p>
      <p className="mt-2 text-[13px] text-text-muted">Usually takes 10–20 seconds</p>
    </main>
  );
}

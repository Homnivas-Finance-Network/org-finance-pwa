"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { takePendingUpload } from "@/lib/uploadHolder";
import { Button } from "@/components/Button";

const MESSAGE_KEYS = [
  "analyzing.msg1",
  "analyzing.msg2",
  "analyzing.msg3",
  "analyzing.msg4",
  "analyzing.msg5",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { setAnalysis } = useJourney();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGE_KEYS.length);
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
      .analyze(pending.cibilPdf, pending.bankStatementPdf, pending.cibilPassword || undefined, pending.bankPassword || undefined)
      .then((result) => {
        if (cancelled) return;
        setAnalysis(result);
        router.push("/dashboard");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : t("analyzing.errorFallback"));
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
          <Button onClick={() => router.push("/upload")}>{t("common.tryAgain")}</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-border-strong border-t-text-accent" />
      <p className="mt-8 font-display text-[17px] font-medium text-text-primary">
        {t(MESSAGE_KEYS[messageIndex])}
      </p>
      <p className="mt-2 text-[13px] text-text-muted">{t("analyzing.estimate")}</p>
    </main>
  );
}

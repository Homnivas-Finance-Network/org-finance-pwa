"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { takePendingUpload } from "@/lib/uploadHolder";
import { Button } from "@/components/Button";

type Stage = "uploading" | "analyzing";

const ANALYZING_MESSAGE_KEYS = [
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
  const [stage, setStage] = useState<Stage>("uploading");
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== "analyzing") return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % ANALYZING_MESSAGE_KEYS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    const pending = takePendingUpload();
    if (!pending) {
      // Direct navigation here without going through /upload first — nothing to analyze
      router.replace("/upload");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        // Step 1: get signed upload URLs (also confirms isPro server-side)
        const urls = await api.getUploadUrls();

        // Step 2: upload both files straight to Storage — this is the part
        // that lets a 50MB file work at all, since it bypasses Cloud Run
        // entirely rather than going through the backend's request body.
        await Promise.all([
          api.uploadToSignedUrl(urls.cibilUploadUrl, pending!.cibilPdf),
          api.uploadToSignedUrl(urls.bankUploadUrl, pending!.bankStatementPdf),
        ]);

        if (cancelled) return;
        setStage("analyzing");

        // Step 3: tell the backend to read those two objects out of Storage
        // and run the actual analysis.
        const result = await api.analyze(
          urls.cibilStoragePath,
          urls.bankStoragePath,
          pending!.cibilPassword || undefined,
          pending!.bankPassword || undefined
        );
        if (cancelled) return;
        setAnalysis(result);
        router.push("/dashboard");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : t("analyzing.errorFallback"));
      }
    }

    run();
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
        {stage === "uploading" ? t("analyzing.uploading") : t(ANALYZING_MESSAGE_KEYS[messageIndex])}
      </p>
      <p className="mt-2 text-[13px] text-text-muted">{t("analyzing.estimate")}</p>
    </main>
  );
}

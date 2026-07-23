"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationResult } from "firebase/auth";
import { sendOtp } from "@/lib/firebase";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/context/LocaleProvider";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(t("landing.errorInvalidPhone"));
      return;
    }
    setLoading(true);
    try {
      const result = await sendOtp(`+91${digits}`, RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
      setStage("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("landing.errorSendFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmation.confirm(code);
      router.push("/quiz");
    } catch {
      setError(t("landing.errorInvalidCode"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-12">
      <div id={RECAPTCHA_CONTAINER_ID} />

      <div className="mb-6 flex justify-end">
        <LanguageSwitcher />
      </div>

      <p className="text-[13px] font-medium uppercase tracking-wider text-text-accent">
        {t("landing.brand")}
      </p>
      <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.15] text-text-primary">
        {t("landing.headline1")}
        <br />
        {t("landing.headline2")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
        {t("landing.subtitle")}
      </p>

      {stage === "phone" ? (
        <form onSubmit={handleSendOtp} className="mt-10 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">
              {t("landing.mobileLabel")}
            </span>
            <div className="flex items-center gap-2 rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 focus-within:border-text-accent">
              <span className="font-mono-figures text-[15px] text-text-secondary">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent font-mono-figures text-[15px] text-text-primary outline-none placeholder:text-text-muted"
                maxLength={10}
              />
            </div>
          </label>
          {error && <p className="text-[13px] text-text-warning">{error}</p>}
          <Button type="submit" loading={loading}>
            {t("landing.sendOtp")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-10 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">
              {t("landing.codeSentTo", { phone })}
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t("landing.codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 text-center font-mono-figures text-lg tracking-[0.3em] text-text-primary outline-none focus:border-text-accent placeholder:tracking-normal placeholder:text-text-muted"
              maxLength={6}
            />
          </label>
          {error && <p className="text-[13px] text-text-warning">{error}</p>}
          <Button type="submit" loading={loading}>
            {t("landing.verifyContinue")}
          </Button>
          <button
            type="button"
            onClick={() => setStage("phone")}
            className="text-[13px] text-text-muted underline underline-offset-2"
          >
            {t("landing.useDifferentNumber")}
          </button>
        </form>
      )}
    </main>
  );
}

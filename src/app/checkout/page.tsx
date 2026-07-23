"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressDots } from "@/components/ProgressDots";
import { Check } from "lucide-react";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const { setIsPro } = useJourney();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const UNLOCKS = [
    t("checkout.unlock1"),
    t("checkout.unlock2"),
    t("checkout.unlock3"),
    t("checkout.unlock4"),
  ];

  useEffect(() => {
    // Wait for Firebase to actually finish resolving auth state before
    // deciding the user is logged out — otherwise there's a flash on every
    // fresh page load where a genuinely logged-in user briefly looks
    // logged-out and gets bounced to the landing page.
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const order = await api.createOrder();
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) throw new Error(t("checkout.errorPaymentNotConfigured"));

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "Homnivas Finance Network",
        description: "Homnivas Pro — one-time unlock",
        order_id: order.id,
        prefill: { contact: user?.phoneNumber ?? undefined },
        theme: { color: "#f0a93b" },
        handler: () => {
          // Webhook on the backend confirms payment and flips isPro server-side —
          // this local flag just lets the UI move forward without waiting/polling.
          setIsPro(true);
          router.push("/profile-setup");
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("checkout.errorCheckoutFailed"));
      setLoading(false);
    }
  }

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  async function handleDevSkip() {
    setError(null);
    setLoading(true);
    try {
      await api.devGrantPro();
      setIsPro(true);
      router.push("/profile-setup");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Dev bypass failed — check ALLOW_DEV_BYPASS is set on the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <FullScreenLoader label={t("checkout.checkingSession")} />;
  if (!user) return null; // redirect above is in flight

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={() => setRazorpayReady(true)} />
      <ProgressDots currentStep={5} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <h1 className="font-display text-[24px] font-semibold text-text-primary">
          {t("checkout.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t("checkout.subtitle")}</p>

        <Card className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-text-secondary">{t("checkout.planLabel")}</span>
            <span className="font-mono-figures text-2xl font-semibold text-text-primary">
              ₹345
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {UNLOCKS.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check size={16} className="mt-0.5 shrink-0 text-text-success" />
                <span className="text-[14px] text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="mt-4 text-[12px] leading-relaxed text-text-muted">
          {t("checkout.legalDisclaimer")}
        </p>

        {error && <p className="mt-3 text-[13px] text-text-warning">{error}</p>}

        <div className="mt-auto pt-8">
          <Button onClick={handlePay} loading={loading} disabled={!razorpayReady}>
            {t("checkout.payButton")}
          </Button>
          {isDevMode && (
            <button
              onClick={handleDevSkip}
              disabled={loading}
              className="mt-3 w-full rounded-card border border-dashed border-text-warning px-4 py-2.5 text-[12px] font-medium text-text-warning disabled:opacity-40"
            >
              ⚠ DEV: Skip payment (NEXT_PUBLIC_DEV_MODE=true)
            </button>
          )}
        </div>
      </main>
    </>
  );
}

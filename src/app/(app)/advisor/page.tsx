"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleProvider";
import { Card } from "@/components/Card";

export default function AdvisorPage() {
  const { t } = useLocale();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(t("advisor.whatsappPrefill"));
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${message}` : null;

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">{t("advisor.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("advisor.subtitle")}</p>
      </div>

      <Card className="mt-6 flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-success">
          <MessageCircle size={26} className="text-text-success" />
        </div>
        <div>
          <h2 className="font-display text-[16px] font-semibold text-text-primary">{t("advisor.whatsappTitle")}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{t("advisor.whatsappDesc")}</p>
        </div>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-card bg-text-success px-5 py-3.5 font-body text-[15px] font-semibold text-bg">
            <MessageCircle size={18} />
            {t("advisor.whatsappButton")}
          </a>
        ) : (
          <p className="mt-2 text-[12px] text-text-warning">{t("advisor.whatsappNotConfigured")}</p>
        )}
      </Card>
    </main>
  );
}

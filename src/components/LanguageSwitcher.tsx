"use client";

import { useLocale } from "@/context/LocaleProvider";
import { type Locale } from "@/lib/i18n/translations";

const LOCALE_ORDER: Locale[] = ["en", "hi", "bn"];
const SHORT_LABELS: Record<Locale, string> = { en: "EN", hi: "हि", bn: "বা" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  function cycleNext() {
    const currentIndex = LOCALE_ORDER.indexOf(locale);
    setLocale(LOCALE_ORDER[(currentIndex + 1) % LOCALE_ORDER.length]);
  }

  return (
    <button
      onClick={cycleNext}
      aria-label="Switch language"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-accent bg-bg-accent text-[11px] font-semibold text-text-accent shadow-sm"
    >
      {SHORT_LABELS[locale]}
    </button>
  );
}

"use client";

import { useLocale } from "@/context/LocaleProvider";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/translations";

const LOCALES: Locale[] = ["en", "hi", "bn"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-1.5">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
            locale === loc
              ? "bg-bg-accent text-text-accent border border-border-accent"
              : "text-text-muted border border-border"
          }`}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}

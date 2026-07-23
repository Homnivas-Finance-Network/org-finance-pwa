"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TRANSLATIONS, type Locale } from "@/lib/i18n/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const STORAGE_KEY = "homnivas-locale";

const LocaleContext = createContext<LocaleContextValue | null>(null);

function loadInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "hi" || stored === "bn") return stored;
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(loadInitialLocale());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[locale];
    let text = dict[key] ?? TRANSLATIONS.en[key] ?? key;
    if (vars) {
      for (const [varName, value] of Object.entries(vars)) {
        text = text.replace(`{${varName}}`, String(value));
      }
    }
    return text;
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

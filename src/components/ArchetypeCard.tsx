"use client";

import type { Archetype } from "@/lib/types";
import { ARCHETYPE_META } from "@/lib/archetype";
import { useLocale } from "@/context/LocaleProvider";

export function ArchetypeCard({ archetype, compact = false }: { archetype: Archetype; compact?: boolean }) {
  const meta = ARCHETYPE_META[archetype];
  const { t } = useLocale();

  return (
    <div
      className="overflow-hidden rounded-card border border-border bg-surface-1"
      style={{ borderTopColor: `var(--${meta.colorVar})`, borderTopWidth: 3 }}
    >
      <div className={compact ? "p-4" : "p-6"}>
        <div className="flex items-center gap-3">
          <span className={compact ? "text-3xl" : "text-5xl"}>{meta.emoji}</span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted">{t("archetype.yourType")}</p>
            <h2 className="font-display text-xl font-semibold text-text-primary">{archetype}</h2>
          </div>
        </div>
        <p className="mt-3 font-display text-sm font-medium" style={{ color: `var(--${meta.colorVar})` }}>
          {t(meta.taglineKey)}
        </p>
        {!compact && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{t(meta.descriptionKey)}</p>
        )}
      </div>
    </div>
  );
}

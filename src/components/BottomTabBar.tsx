"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileCheck2, Sparkles, User } from "lucide-react";
import { useLocale } from "@/context/LocaleProvider";

const TABS = [
  { href: "/dashboard", labelKey: "tabs.home", icon: Home },
  { href: "/apply", labelKey: "tabs.apply", icon: FileCheck2 },
  { href: "/advisor", labelKey: "tabs.advisor", icon: Sparkles },
  { href: "/profile", labelKey: "tabs.profile", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-border bg-surface-1/95 backdrop-blur">
      {TABS.map(({ href, labelKey, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            <Icon size={20} className={active ? "text-text-accent" : "text-text-muted"} />
            <span
              className={`text-[11px] font-medium ${active ? "text-text-accent" : "text-text-muted"}`}
            >
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

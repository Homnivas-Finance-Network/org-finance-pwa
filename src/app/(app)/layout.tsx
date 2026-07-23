"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { analysis } = useJourney();
  const { t } = useLocale();

  useEffect(() => {
    if (authLoading) return; // don't decide anything until Firebase actually resolves
    if (!user) {
      router.replace("/");
      return;
    }
    if (!analysis) {
      router.replace("/upload");
    }
  }, [authLoading, user, analysis, router]);

  if (authLoading) return <FullScreenLoader label={t("checkout.checkingSession")} />;
  if (!user || !analysis) return null; // redirect above is in flight

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomTabBar />
    </div>
  );
}

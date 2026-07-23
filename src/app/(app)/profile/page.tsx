"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLocale } from "@/context/LocaleProvider";
import { Card } from "@/components/Card";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface ProfileData {
  name?: string;
  pan?: string;
  city?: string;
  employmentType?: string;
  monthlySalary?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    api
      .getProfile()
      .then((data) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  if (loadingProfile) return <FullScreenLoader label={t("common.loading")} />;

  return (
    <main className="flex flex-1 flex-col gap-5 px-6 py-8 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-text-primary">
            {t("profile.title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{user?.phoneNumber}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <Row label={t("profile.nameLabel")} value={profile?.name} />
          <Row label={t("profile.panLabel")} value={profile?.pan} mono />
          <Row label={t("profile.cityLabel")} value={profile?.city} />
          <Row label={t("profile.employmentLabel")} value={profile?.employmentType} />
          <Row
            label={t("profile.incomeLabel")}
            value={
              profile?.monthlySalary
                ? `₹${profile.monthlySalary.toLocaleString("en-IN")}`
                : undefined
            }
            mono
          />
        </div>
      </Card>

      <button
        onClick={() => router.push("/upload")}
        className="flex items-center justify-center gap-2 rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 text-[14px] font-medium text-text-primary transition-colors hover:border-text-accent"
      >
        <RefreshCw size={16} />
        {t("profile.reuploadButton")}
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 rounded-card border border-border-strong px-4 py-3.5 text-[14px] font-medium text-text-warning transition-colors hover:border-text-warning"
      >
        <LogOut size={16} />
        {t("profile.logoutButton")}
      </button>
    </main>
  );
}

function Row({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className={`text-[14px] text-text-primary ${mono ? "font-mono-figures" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

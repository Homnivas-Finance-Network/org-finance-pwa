import { Lock } from "lucide-react";
import type { ReactNode } from "react";

export function LockOverlay({
  children,
  label = "Unlock with Homnivas Pro",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-accent border border-border-accent">
          <Lock size={16} className="text-text-accent" />
        </div>
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      </div>
    </div>
  );
}

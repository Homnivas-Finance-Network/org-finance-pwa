export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-text-accent" />
      <p className="mt-4 text-[13px] text-text-muted">{label}</p>
    </main>
  );
}

"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload as UploadIcon, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressDots } from "@/components/ProgressDots";
import { setPendingUpload } from "@/lib/uploadHolder";

function FilePicker({
  label,
  hint,
  file,
  onSelect,
  onClear,
}: {
  label: string;
  hint: string;
  file: File | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium text-text-primary">{label}</p>
          <p className="mt-0.5 text-[12px] text-text-muted">{hint}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />

      {file ? (
        <div className="mt-3 flex items-center justify-between rounded-card border border-border-success bg-bg-success px-4 py-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="shrink-0 text-text-success" />
            <span className="truncate text-[13px] text-text-success">{file.name}</span>
          </div>
          <button type="button" onClick={onClear} aria-label={`Remove ${label}`}>
            <X size={16} className="text-text-success" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex w-full flex-col items-center gap-2 rounded-card border border-dashed border-border-strong px-4 py-6 text-text-secondary transition-colors hover:border-text-accent"
        >
          <UploadIcon size={18} />
          <span className="text-[13px]">Tap to select PDF</span>
        </button>
      )}
    </Card>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [cibilPdf, setCibilPdf] = useState<File | null>(null);
  const [bankPdf, setBankPdf] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!cibilPdf || !bankPdf) {
      setError("Both files are needed to generate your dashboard.");
      return;
    }
    setPendingUpload({ cibilPdf, bankStatementPdf: bankPdf, password });
    router.push("/analyzing");
  }

  return (
    <>
      <ProgressDots currentStep={7} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          Upload your documents
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Both are read once to build your dashboard, nothing is shared beyond that.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FilePicker
            label="CIBIL report"
            hint="Download free from the GPay or Cred app → Credit Score section"
            file={cibilPdf}
            onSelect={setCibilPdf}
            onClear={() => setCibilPdf(null)}
          />
          <FilePicker
            label="Bank statement"
            hint="Last 6 months, any bank, PDF format"
            file={bankPdf}
            onSelect={setBankPdf}
            onClear={() => setBankPdf(null)}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">
              PDF password (if any)
            </span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank if not password-protected"
              className="rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-text-accent placeholder:text-text-muted"
            />
          </label>

          {error && <p className="text-[13px] text-text-warning">{error}</p>}

          <div className="mt-2">
            <Button type="submit">Generate my dashboard</Button>
          </div>
        </form>
      </main>
    </>
  );
}

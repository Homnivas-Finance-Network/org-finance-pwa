"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload as UploadIcon, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressDots } from "@/components/ProgressDots";
import { setPendingUpload } from "@/lib/uploadHolder";
import { useLocale } from "@/context/LocaleProvider";

function FilePicker({
  label,
  hint,
  file,
  password,
  onSelect,
  onClear,
  onPasswordChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  password: string;
  onSelect: (file: File) => void;
  onClear: () => void;
  onPasswordChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

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
          <span className="text-[13px]">{t("upload.tapToSelect")}</span>
        </button>
      )}

      {file && (
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-[12px] text-text-muted">{t("upload.passwordLabel")}</span>
          <input
            type="text"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t("upload.passwordPlaceholder")}
            className="rounded-card border border-border-strong bg-surface-1 px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-text-accent placeholder:text-text-muted"
          />
        </label>
      )}
    </Card>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [cibilPdf, setCibilPdf] = useState<File | null>(null);
  const [bankPdf, setBankPdf] = useState<File | null>(null);
  const [cibilPassword, setCibilPassword] = useState("");
  const [bankPassword, setBankPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!cibilPdf || !bankPdf) {
      setError(t("upload.errorBothFilesNeeded"));
      return;
    }
    setPendingUpload({
      cibilPdf,
      bankStatementPdf: bankPdf,
      cibilPassword,
      bankPassword,
    });
    router.push("/analyzing");
  }

  return (
    <>
      <ProgressDots currentStep={7} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          {t("upload.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t("upload.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FilePicker
            label={t("upload.cibilLabel")}
            hint={t("upload.cibilHint")}
            file={cibilPdf}
            password={cibilPassword}
            onSelect={setCibilPdf}
            onClear={() => setCibilPdf(null)}
            onPasswordChange={setCibilPassword}
          />
          <FilePicker
            label={t("upload.bankLabel")}
            hint={t("upload.bankHint")}
            file={bankPdf}
            password={bankPassword}
            onSelect={setBankPdf}
            onClear={() => setBankPdf(null)}
            onPasswordChange={setBankPassword}
          />

          {error && <p className="text-[13px] text-text-warning">{error}</p>}

          <div className="mt-2">
            <Button type="submit">{t("upload.generateButton")}</Button>
          </div>
        </form>
      </main>
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";

const EMPLOYMENT_TYPES = ["Salaried", "Self-employed", "Business owner", "Freelancer"];

const inputClass =
  "rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-text-accent placeholder:text-text-muted";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [city, setCity] = useState("");
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [monthlySalary, setMonthlySalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panPattern.test(pan.toUpperCase())) {
      setError("That doesn't look like a valid PAN (format: ABCDE1234F).");
      return;
    }

    setLoading(true);
    try {
      await api.saveProfile({
        name,
        pan: pan.toUpperCase(),
        city,
        employmentType,
        monthlySalary: Number(monthlySalary),
      });
      router.push("/upload");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save that. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ProgressDots currentStep={6} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          A few details
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          This is what your analysis will be built around.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As per your PAN"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">PAN number</span>
            <input
              required
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
              className={`${inputClass} font-mono-figures uppercase tracking-wider`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">City</span>
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kolkata"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">Employment type</span>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className={inputClass}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-secondary">Monthly income</span>
            <div className="flex items-center gap-2 rounded-card border border-border-strong bg-surface-1 px-4 py-3.5 focus-within:border-text-accent">
              <span className="text-[15px] text-text-secondary">₹</span>
              <input
                required
                type="number"
                inputMode="numeric"
                min={0}
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="50,000"
                className="w-full bg-transparent font-mono-figures text-[15px] text-text-primary outline-none placeholder:text-text-muted placeholder:font-body"
              />
            </div>
          </label>

          {error && <p className="text-[13px] text-text-warning">{error}</p>}

          <div className="mt-4">
            <Button type="submit" loading={loading}>
              Continue
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

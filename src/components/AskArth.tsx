"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { api, ApiError } from "@/lib/api";

interface Exchange {
  question: string;
  answer: string;
}

export function AskArth() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setError(null);
    setLoading(true);
    const asked = question;
    setQuestion("");
    try {
      const result = await api.askAdvisor(asked);
      setHistory((h) => [...h, { question: asked, answer: result.answer }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Arth is busy, try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-text-accent" />
        <h2 className="font-display text-[15px] font-semibold text-text-primary">Ask Arth</h2>
      </div>
      <p className="mt-1 text-[12px] text-text-muted">
        Answers based on your actual numbers, not generic advice.
      </p>

      {history.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {history.map((exchange, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="self-end rounded-card rounded-br-sm bg-bg-accent px-3 py-2 text-[13px] text-text-accent">
                {exchange.question}
              </p>
              <p className="rounded-card rounded-bl-sm bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-text-primary">
                {exchange.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-[13px] text-text-warning">{error}</p>}

      <form onSubmit={handleAsk} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Should I prepay my personal loan?"
          className="flex-1 rounded-card border border-border-strong bg-surface-1 px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-text-accent placeholder:text-text-muted"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-card bg-text-accent px-4 py-2.5 text-[13px] font-semibold text-bg disabled:opacity-40"
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>
    </Card>
  );
}

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Archetype, QuizAnswers, AnalysisResult } from "@/lib/types";

interface JourneyState {
  quizAnswers: QuizAnswers | null;
  archetype: Archetype | null;
  isPro: boolean;
  analysis: AnalysisResult | null;
}

interface JourneyContextValue extends JourneyState {
  setQuizAnswers: (answers: QuizAnswers) => void;
  setArchetype: (archetype: Archetype) => void;
  setIsPro: (isPro: boolean) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
}

const STORAGE_KEY = "homnivas-journey";

const JourneyContext = createContext<JourneyContextValue | null>(null);

function loadInitial(): JourneyState {
  if (typeof window === "undefined") {
    return { quizAnswers: null, archetype: null, isPro: false, analysis: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted or missing — fall through to defaults
  }
  return { quizAnswers: null, archetype: null, isPro: false, analysis: null };
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(loadInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value: JourneyContextValue = {
    ...state,
    setQuizAnswers: (quizAnswers) => setState((s) => ({ ...s, quizAnswers })),
    setArchetype: (archetype) => setState((s) => ({ ...s, archetype })),
    setIsPro: (isPro) => setState((s) => ({ ...s, isPro })),
    setAnalysis: (analysis) => setState((s) => ({ ...s, analysis })),
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used inside JourneyProvider");
  return ctx;
}

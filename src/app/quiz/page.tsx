"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS } from "@/lib/archetype";
import { computeArchetype } from "@/lib/archetype";
import { useJourney } from "@/context/JourneyProvider";
import { useLocale } from "@/context/LocaleProvider";
import { ProgressDots } from "@/components/ProgressDots";
import type { QuizAnswers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { setQuizAnswers, setArchetype } = useJourney();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const question = QUIZ_QUESTIONS[current];
  const isLast = current === QUIZ_QUESTIONS.length - 1;

  function selectOption(value: string) {
    const updated = { ...answers, [question.key]: value };
    setAnswers(updated);

    if (isLast) {
      const finalAnswers = updated as QuizAnswers;
      setQuizAnswers(finalAnswers);
      setArchetype(computeArchetype(finalAnswers));
      router.push("/reveal");
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <>
      <ProgressDots currentStep={2} />
      <main className="flex flex-1 flex-col px-6 py-8">
        <p className="text-[13px] font-medium text-text-muted">
          {t("quiz.questionOf", { current: current + 1, total: QUIZ_QUESTIONS.length })}
        </p>
        <h1 className="mt-2 font-display text-[24px] font-semibold leading-snug text-text-primary">
          {t(question.promptKey)}
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => selectOption(option.value)}
              className="rounded-card border border-border-strong bg-surface-1 px-5 py-4 text-left text-[15px] text-text-primary transition-colors hover:border-text-accent hover:bg-surface-2"
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>

        {current > 0 && (
          <button
            onClick={() => setCurrent((c) => c - 1)}
            className="mt-8 text-[13px] text-text-muted underline underline-offset-2"
          >
            {t("common.back")}
          </button>
        )}
      </main>
    </>
  );
}

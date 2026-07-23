import type { Archetype, QuizAnswers } from "./types";

export interface QuizOption {
  value: string;
  labelKey: string;
  weights: Partial<Record<Archetype, number>>;
}

export interface QuizQuestion {
  key: keyof QuizAnswers;
  promptKey: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: "income",
    promptKey: "quiz.q1.prompt",
    options: [
      { value: "steady", labelKey: "quiz.q1.opt_steady", weights: { Saver: 1, Builder: 1 } },
      { value: "irregular", labelKey: "quiz.q1.opt_irregular", weights: { Survivor: 1, Achiever: 1 } },
      { value: "new", labelKey: "quiz.q1.opt_new", weights: { Starter: 2 } },
      { value: "multiple", labelKey: "quiz.q1.opt_multiple", weights: { Achiever: 1, Builder: 1 } },
    ],
  },
  {
    key: "savingsHabit",
    promptKey: "quiz.q2.prompt",
    options: [
      { value: "fixed-save", labelKey: "quiz.q2.opt_fixed_save", weights: { Saver: 2 } },
      { value: "pay-emis", labelKey: "quiz.q2.opt_pay_emis", weights: { Survivor: 1 } },
      { value: "reinvest", labelKey: "quiz.q2.opt_reinvest", weights: { Achiever: 1, Builder: 1 } },
      { value: "runs-out", labelKey: "quiz.q2.opt_runs_out", weights: { Survivor: 1, Starter: 1 } },
    ],
  },
  {
    key: "debtSituation",
    promptKey: "quiz.q3.prompt",
    options: [
      { value: "none", labelKey: "quiz.q3.opt_none", weights: { Saver: 1, Starter: 1 } },
      { value: "one-planned", labelKey: "quiz.q3.opt_one_planned", weights: { Builder: 2 } },
      { value: "few-small", labelKey: "quiz.q3.opt_few_small", weights: { Survivor: 1 } },
      { value: "multiple-app-loans", labelKey: "quiz.q3.opt_multiple_app_loans", weights: { Survivor: 2 } },
    ],
  },
  {
    key: "cibilAwareness",
    promptKey: "quiz.q4.prompt",
    options: [
      { value: "know-well", labelKey: "quiz.q4.opt_know_well", weights: { Builder: 1, Achiever: 1 } },
      { value: "know-roughly", labelKey: "quiz.q4.opt_know_roughly", weights: { Saver: 1 } },
      { value: "no-idea", labelKey: "quiz.q4.opt_no_idea", weights: { Starter: 2 } },
      { value: "worried", labelKey: "quiz.q4.opt_worried", weights: { Survivor: 2 } },
    ],
  },
  {
    key: "goal",
    promptKey: "quiz.q5.prompt",
    options: [
      { value: "debt-free-plan", labelKey: "quiz.q5.opt_debt_free_plan", weights: { Survivor: 2 } },
      { value: "grow-more", labelKey: "quiz.q5.opt_grow_more", weights: { Achiever: 2 } },
      { value: "first-cushion", labelKey: "quiz.q5.opt_first_cushion", weights: { Starter: 2 } },
      { value: "money-work-harder", labelKey: "quiz.q5.opt_money_work_harder", weights: { Builder: 2 } },
    ],
  },
];

export const ARCHETYPE_META: Record<
  Archetype,
  { emoji: string; taglineKey: string; descriptionKey: string; colorVar: string }
> = {
  Builder: {
    emoji: "🏗️",
    taglineKey: "archetype.Builder.tagline",
    descriptionKey: "archetype.Builder.description",
    colorVar: "archetype-builder",
  },
  Saver: {
    emoji: "💰",
    taglineKey: "archetype.Saver.tagline",
    descriptionKey: "archetype.Saver.description",
    colorVar: "archetype-saver",
  },
  Achiever: {
    emoji: "🚀",
    taglineKey: "archetype.Achiever.tagline",
    descriptionKey: "archetype.Achiever.description",
    colorVar: "archetype-achiever",
  },
  Survivor: {
    emoji: "🌊",
    taglineKey: "archetype.Survivor.tagline",
    descriptionKey: "archetype.Survivor.description",
    colorVar: "archetype-survivor",
  },
  Starter: {
    emoji: "🌱",
    taglineKey: "archetype.Starter.tagline",
    descriptionKey: "archetype.Starter.description",
    colorVar: "archetype-starter",
  },
};

const PRIORITY_TIEBREAK: Archetype[] = ["Survivor", "Builder", "Achiever", "Saver", "Starter"];

export function computeArchetype(answers: QuizAnswers): Archetype {
  const scores: Record<Archetype, number> = {
    Builder: 0,
    Saver: 0,
    Achiever: 0,
    Survivor: 0,
    Starter: 0,
  };

  for (const question of QUIZ_QUESTIONS) {
    const answerValue = answers[question.key];
    const option = question.options.find((o) => o.value === answerValue);
    if (!option) continue;
    for (const [archetype, weight] of Object.entries(option.weights)) {
      scores[archetype as Archetype] += weight ?? 0;
    }
  }

  let best: Archetype = PRIORITY_TIEBREAK[0];
  let bestScore = -1;
  for (const archetype of PRIORITY_TIEBREAK) {
    if (scores[archetype] > bestScore) {
      bestScore = scores[archetype];
      best = archetype;
    }
  }
  return best;
}

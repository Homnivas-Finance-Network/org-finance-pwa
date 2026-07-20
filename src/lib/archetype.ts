import type { Archetype, QuizAnswers } from "./types";

export interface QuizOption {
  value: string;
  label: string;
  weights: Partial<Record<Archetype, number>>;
}

export interface QuizQuestion {
  key: keyof QuizAnswers;
  prompt: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: "income",
    prompt: "How would you describe your income right now?",
    options: [
      { value: "steady", label: "Steady salary, same amount every month", weights: { Saver: 1, Builder: 1 } },
      { value: "irregular", label: "Irregular — freelance, business, or commission", weights: { Survivor: 1, Achiever: 1 } },
      { value: "new", label: "Just started earning, still figuring it out", weights: { Starter: 2 } },
      { value: "multiple", label: "Multiple income sources, actively growing them", weights: { Achiever: 1, Builder: 1 } },
    ],
  },
  {
    key: "savingsHabit",
    prompt: "When money hits your account, what usually happens first?",
    options: [
      { value: "fixed-save", label: "A fixed chunk goes to savings before anything else", weights: { Saver: 2 } },
      { value: "pay-emis", label: "I pay off EMIs and bills, save what's left", weights: { Survivor: 1 } },
      { value: "reinvest", label: "I invest or reinvest it into something", weights: { Achiever: 1, Builder: 1 } },
      { value: "runs-out", label: "Honestly, it goes out faster than it came in", weights: { Survivor: 1, Starter: 1 } },
    ],
  },
  {
    key: "debtSituation",
    prompt: "Which sounds most like you right now?",
    options: [
      { value: "none", label: "No loans, I keep things simple", weights: { Saver: 1, Starter: 1 } },
      { value: "one-planned", label: "One planned loan — home, car, or education", weights: { Builder: 2 } },
      { value: "few-small", label: "A few small loans or EMIs running at once", weights: { Survivor: 1 } },
      { value: "multiple-app-loans", label: "Juggling multiple app loans or credit cards", weights: { Survivor: 2 } },
    ],
  },
  {
    key: "cibilAwareness",
    prompt: "Your CIBIL score — be honest:",
    options: [
      { value: "know-well", label: "I check it regularly, know it well", weights: { Builder: 1, Achiever: 1 } },
      { value: "know-roughly", label: "I know roughly, haven't checked lately", weights: { Saver: 1 } },
      { value: "no-idea", label: "No idea, never checked", weights: { Starter: 2 } },
      { value: "worried", label: "I know it's not great and it worries me", weights: { Survivor: 2 } },
    ],
  },
  {
    key: "goal",
    prompt: "What would actually change things for you right now?",
    options: [
      { value: "debt-free-plan", label: "A clear plan to get debt-free", weights: { Survivor: 2 } },
      { value: "grow-more", label: "Growing what I already have", weights: { Achiever: 2 } },
      { value: "first-cushion", label: "Building my first real financial cushion", weights: { Starter: 2 } },
      { value: "money-work-harder", label: "Making my money work harder — fewer wasted EMIs", weights: { Builder: 2 } },
    ],
  },
];

export const ARCHETYPE_META: Record<
  Archetype,
  { emoji: string; tagline: string; description: string; colorVar: string }
> = {
  Builder: {
    emoji: "🏗️",
    tagline: "You build with intention",
    description:
      "You think in structures — planned loans, deliberate growth, a clear reason behind every EMI. Your risk is over-optimizing instead of just starting.",
    colorVar: "archetype-builder",
  },
  Saver: {
    emoji: "💰",
    tagline: "You protect first, spend second",
    description:
      "Savings come before anything else hits your account. Your risk is playing too safe when a calculated move could actually get you further, faster.",
    colorVar: "archetype-saver",
  },
  Achiever: {
    emoji: "🚀",
    tagline: "You're already in motion",
    description:
      "Multiple income streams, active reinvestment, growth on the mind. Your risk is moving fast enough that small leaks — fees, bad-rate EMIs — go unnoticed.",
    colorVar: "archetype-achiever",
  },
  Survivor: {
    emoji: "🌊",
    tagline: "You're managing more than most people see",
    description:
      "Juggling EMIs, staying afloat, doing the math every month. Nothing about that is a character flaw — it's a math problem, and math problems have solutions.",
    colorVar: "archetype-survivor",
  },
  Starter: {
    emoji: "🌱",
    tagline: "You're at the beginning, on purpose",
    description:
      "New income, new habits, no fixed patterns yet. That's an advantage — the habits you build in the next year matter more than the ones you're undoing.",
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

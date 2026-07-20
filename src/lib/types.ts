export type Archetype = "Builder" | "Saver" | "Achiever" | "Survivor" | "Starter";

export interface QuizAnswers {
  income: string;
  savingsHabit: string;
  debtSituation: string;
  cibilAwareness: string;
  goal: string;
}

export interface AnalysisResult {
  arthScore: number;
  actualCibil: number;
  monthlySalary: number;
  totalCurrentEmi: number;
  debtReductionRoadmap: string[];
  chartData: {
    emis: number;
    livingExpenses: number;
    savings: number;
  };
  ELIGIBLE_FOR_1_EMI: boolean;
  fdSignalDetected: boolean;
  estimatedFDValue: number | null;
  analysisId: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

// Minimal shape of the Razorpay Checkout.js window global — the actual
// script is loaded at runtime in checkout/page.tsx, this just types it.
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

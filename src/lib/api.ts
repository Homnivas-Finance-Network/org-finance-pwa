import { getIdToken } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it as a build-time env var in Cloudflare Pages."
    );
  }
  const token = await getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON, keep statusText
    }
    throw new ApiError(res.status, detail);
  }
  return res;
}

export const api = {
  createOrder: async () => {
    const res = await authedFetch("/api/payments/create-order", { method: "POST" });
    return res.json();
  },

  devGrantPro: async () => {
    const res = await authedFetch("/api/payments/dev-grant-pro", { method: "POST" });
    return res.json();
  },

  saveProfile: async (profile: {
    name: string;
    pan: string;
    city: string;
    employmentType: string;
    monthlySalary: number;
  }) => {
    const form = new FormData();
    Object.entries(profile).forEach(([k, v]) => form.set(k, String(v)));
    const res = await authedFetch("/api/profile/setup", { method: "POST", body: form });
    return res.json();
  },

  getProfile: async () => {
    const res = await authedFetch("/api/profile/me");
    return res.json();
  },

  analyze: async (
    cibilPdf: File,
    bankStatementPdf: File,
    cibilPassword?: string,
    bankPassword?: string
  ) => {
    const form = new FormData();
    form.set("cibilPdf", cibilPdf);
    form.set("bankStatementPdf", bankStatementPdf);
    if (cibilPassword) form.set("cibilPassword", cibilPassword);
    if (bankPassword) form.set("bankPassword", bankPassword);
    const res = await authedFetch("/api/analytics/analyze", { method: "POST", body: form });
    return res.json();
  },

  declareFD: async (declaredAmount: number) => {
    const form = new FormData();
    form.set("declaredAmount", String(declaredAmount));
    const res = await authedFetch("/api/analytics/eligibility/loan-against-fd/self-declare", {
      method: "POST",
      body: form,
    });
    return res.json();
  },

  submitLead: async (productType: "ONE_EMI" | "LOAN_AGAINST_FD", declaredFDAmount?: number) => {
    const res = await authedFetch("/api/leads/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productType, declaredFDAmount }),
    });
    return res.json();
  },

  askAdvisor: async (question: string) => {
    const form = new FormData();
    form.set("question", question);
    const res = await authedFetch("/api/analytics/ask", { method: "POST", body: form });
    return res.json();
  },

  getHistory: async () => {
    const res = await authedFetch("/api/analytics/history");
    return res.json();
  },
};

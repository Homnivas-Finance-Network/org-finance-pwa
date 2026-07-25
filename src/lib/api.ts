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

  getUploadUrls: async (): Promise<{
    cibilUploadUrl: string;
    cibilStoragePath: string;
    bankUploadUrl: string;
    bankStoragePath: string;
  }> => {
    const res = await authedFetch("/api/analytics/upload-urls", { method: "POST" });
    return res.json();
  },

  /** PUT straight to the signed Cloud Storage URL — no auth header (the
   * signature itself is the auth), no API_BASE prefix (it's an absolute
   * storage.googleapis.com URL), and critically not routed through the
   * backend at all, which is the whole point: this is how a 50MB file gets
   * past Cloud Run's 32MB request limit — it never goes through Cloud Run. */
  uploadToSignedUrl: async (url: string, file: File): Promise<void> => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
    if (!res.ok) {
      throw new ApiError(res.status, `Upload failed (${res.status}). Check your connection and try again.`);
    }
  },

  analyze: async (
    cibilStoragePath: string,
    bankStoragePath: string,
    cibilPassword?: string,
    bankPassword?: string
  ) => {
    const res = await authedFetch("/api/analytics/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cibilStoragePath,
        bankStoragePath,
        cibilPassword: cibilPassword || undefined,
        bankPassword: bankPassword || undefined,
      }),
    });
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
